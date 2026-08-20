import torch
from torch import nn
import torchvision
from torch.nn import functional as F
from efficientnet_pytorch import EfficientNet




class Detector(nn.Module):

    def __init__(self):
        super(Detector, self).__init__()
        # The detector checkpoint supplies all parameters.  Building from the
        # architecture name keeps inference offline and avoids a second
        # EfficientNet weight download at service startup.
        self.net=EfficientNet.from_name("efficientnet-b4",num_classes=2)
        

    def forward(self,x):
        x=self.net(x)
        return x
    
    
