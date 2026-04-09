import torch
import torch.nn as nn
import torch.nn.functional as F

# --- 1. الـ DoubleConv بالهيكل اللي الأوزان عاوزاه ---
class DoubleConv(nn.Module):
    def __init__(self, in_ch, out_ch):
        super().__init__()
        self.net = nn.Sequential(
            nn.Conv2d(in_ch, out_ch, 3, padding=1),
            nn.BatchNorm2d(out_ch),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_ch, out_ch, 3, padding=1),
            nn.BatchNorm2d(out_ch),
            nn.ReLU(inplace=True),
        )

    def forward(self, x):
        return self.net(x)

# --- 2. الـ UNet بالمسميات المطابقة للـ State Dict ---
class UNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.down1 = DoubleConv(3, 64)
        self.down2 = DoubleConv(64, 128)
        self.down3 = DoubleConv(128, 256)
        self.pool = nn.MaxPool2d(2)
        self.middle = DoubleConv(256, 512)
        self.up3 = nn.ConvTranspose2d(512, 256, 2, stride=2)
        self.conv3 = DoubleConv(512, 256)
        self.up2 = nn.ConvTranspose2d(256, 128, 2, stride=2)
        self.conv2 = DoubleConv(256, 128)
        self.up1 = nn.ConvTranspose2d(128, 64, 2, stride=2)
        self.conv1 = DoubleConv(128, 64)
        self.out = nn.Conv2d(64, 1, 1)

    def forward(self, x):
        d1 = self.down1(x)
        d2 = self.down2(self.pool(d1))
        d3 = self.down3(self.pool(d2))
        m = self.middle(self.pool(d3))
        u3 = self.up3(m)
        u3 = self.conv3(torch.cat([u3, d3], dim=1))
        u2 = self.up2(u3)
        u2 = self.conv2(torch.cat([u2, d2], dim=1))
        u1 = self.up1(u2)
        u1 = self.conv1(torch.cat([u1, d1], dim=1))
        return self.out(u1)

# --- 3. الـ Encoder مع تعديل الـ Latent لـ 256 ---
class MultiModalEncoder(nn.Module):
    def __init__(self, latent_dim=256): # رجعناه 256 بناءً على الإيرور
        super().__init__()
        in_ch = 4
        self.conv1 = nn.Sequential(nn.Conv2d(in_ch, 64, 3, stride=2, padding=1), nn.BatchNorm2d(64), nn.ReLU())
        self.conv2 = nn.Sequential(nn.Conv2d(64, 128, 3, stride=2, padding=1), nn.BatchNorm2d(128), nn.ReLU())
        self.conv3 = nn.Sequential(nn.Conv2d(128, 256, 3, stride=2, padding=1), nn.BatchNorm2d(256), nn.ReLU())
        self.conv4 = nn.Sequential(nn.Conv2d(256, 512, 3, stride=2, padding=1), nn.BatchNorm2d(512), nn.ReLU())
        self.pool = nn.AdaptiveAvgPool2d(1)
        self.fc = nn.Sequential(
            nn.Linear(512, 512),
            nn.ReLU(),
            nn.Linear(512, latent_dim)
        )

    def forward(self, img_masked, mask):
        x = torch.cat([img_masked, mask], dim=1)
        x = self.conv1(x)
        x = self.conv2(x)
        x = self.conv3(x)
        x = self.conv4(x)
        x = self.pool(x).view(x.size(0), -1)
        return self.fc(x)

# --- 4. الـ Decoder والـ GNN ---
class GNNBlock(nn.Module):
    def __init__(self, in_ch, out_ch):
        super().__init__()
        self.fc = nn.Linear(in_ch, out_ch)
    def forward(self, x, edge_index):
        row, col = edge_index
        agg = torch.zeros_like(x)
        agg.index_add_(0, row, x[col])
        return F.relu(self.fc(x + agg))

class PointCloudDecoderGNN(nn.Module):
    def __init__(self, latent_dim=256, hidden_dim=256, num_points=3072):
        super().__init__()
        self.num_points = num_points
        self.fc_latent = nn.Linear(latent_dim, num_points * hidden_dim)
        self.gnn1 = GNNBlock(hidden_dim, hidden_dim)
        self.gnn2 = GNNBlock(hidden_dim, hidden_dim)
        self.gnn3 = GNNBlock(hidden_dim, hidden_dim)
        self.fc_out = nn.Linear(hidden_dim, 3)

    def forward(self, z):
        B = z.size(0)
        x = self.fc_latent(z).view(B, self.num_points, -1)
        pcs = []
        for b in range(B):
            xb = x[b]
            dists = torch.cdist(xb[..., :3], xb[..., :3])
            knn_idx = dists.topk(k=9, largest=False).indices[:, 1:]
            row = torch.arange(self.num_points, device=z.device).unsqueeze(1).repeat(1, 8).flatten()
            col = knn_idx.flatten()
            edge_index = torch.stack([row, col], dim=0)
            xb = self.gnn1(xb, edge_index); xb = self.gnn2(xb, edge_index); xb = self.gnn3(xb, edge_index)
            pcs.append(self.fc_out(xb))
        pcs = torch.stack(pcs, dim=0)
        return pcs

# --- 5. الموديل النهائي المجمع ---
class MultiModal3DModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.segmenter = UNet()
        self.encoder = MultiModalEncoder(latent_dim=256)
        self.decoder = PointCloudDecoderGNN(latent_dim=256, hidden_dim=256, num_points=3072)

    def forward(self, img):
        mask = torch.sigmoid(self.segmenter(img))
        latent = self.encoder(img * mask, mask)
        return self.decoder(latent)