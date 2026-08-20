# Deepfake detection platform

This combines the Next.js upload interface with the SelfBlendedImages (SBI) detector in `../SelfBlendedImages-master`.

## Run the complete workflow

1. Download the SBI `FFraw.tar` pretrained weight linked in the [SBI README](../SelfBlendedImages-master/README.md), then place it in `../SelfBlendedImages-master/weights/FFraw.tar`. The weight is not distributed with this repository.
2. Install the detector dependencies and start both services:

```powershell
py -3.13 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
npm install
pip install --no-deps retinaface-pytorch==0.0.8
npm run dev:all
```

Open `http://localhost:3000/analyze`. The browser sends media to `http://localhost:8000/analyze`; SBI scores detected faces and the UI presents the result. Set `SBI_WEIGHTS` to use a different checkpoint path and `NEXT_PUBLIC_DETECTOR_API_URL` if the API is not on port 8000.

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_noZkBFO3IbDg9rWw3dtyxGa8MBuC)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.
