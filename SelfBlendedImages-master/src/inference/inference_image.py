import os
import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim
import torchvision
from torchvision import datasets, transforms, models, utils
import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
from PIL import Image
import sys
import random
import shutil
import cv2
from model import Detector
import argparse
from datetime import datetime
from tqdm import tqdm
from retinaface.pre_trained_models import get_model
from preprocess import extract_face
import warnings

warnings.filterwarnings('ignore')


def main(args):

    model = Detector()
    model = model.to(device)

    cnn_sd = torch.load(args.weight_name, map_location=device)["model"]
    model.load_state_dict(cnn_sd)
    model.eval()

    frame = cv2.imread(args.input_image)

    if frame is None:
        print("ERROR: Could not read image:", args.input_image)
        return

    frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    face_detector = get_model(
        "resnet50_2020-07-20",
        max_size=max(frame.shape),
        device=device
    )

    face_detector.eval()

    face_list = extract_face(frame, face_detector)

    if len(face_list) == 0:
        print("ERROR: No face detected.")
        return

    with torch.no_grad():

        img = torch.tensor(face_list).to(device).float() / 255

        pred = (
            model(img)
            .softmax(1)[:, 1]
            .cpu()
            .data
            .numpy()
            .tolist()
        )

    print()
    print("=" * 50)
    print("OFFICIAL SELF-BLENDED IMAGES INFERENCE")
    print("=" * 50)
    print(f"Faces detected : {len(face_list)}")
    print(f"Fakeness score : {max(pred):.4f}")
    print(f"Fakeness (%)   : {max(pred) * 100:.2f}%")
    print("=" * 50)


if __name__ == '__main__':

    seed = 1

    random.seed(seed)
    torch.manual_seed(seed)
    np.random.seed(seed)

    if torch.cuda.is_available():
        torch.cuda.manual_seed(seed)

    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False

    device = torch.device(
        'cuda' if torch.cuda.is_available() else 'cpu'
    )

    parser = argparse.ArgumentParser()

    parser.add_argument(
        '-w',
        dest='weight_name',
        type=str
    )

    parser.add_argument(
        '-i',
        dest='input_image',
        type=str
    )

    args = parser.parse_args()

    main(args)