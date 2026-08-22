# Finora - Buildathon Submission Video Script

**Target Length:** 5 Minutes

### [0:00-0:30] The Problem
**Visual**: Split screen showing an exhausted accountant looking at 3 messy spreadsheets. Then transition to the clean Finora Login Screen.
**Audio**: "Every day, finance teams manually compare three spreadsheets: internal orders, payment gateway settlements, and bank statements. It's a nightmare. Meet Finora, your AI Finance Controller."

### [0:30-1:00] Onboarding
**Visual**: User logs into Finora. Shows uploading a CSV file (or running the data generator script).
**Audio**: "Setting up is instant. We connect to Razorpay, ingest your bank statements, and normalize your internal ledgers automatically. Let's process 300 records."

### [1:00-1:30] Dashboard
**Visual**: The main Dashboard loads. The metric cards count up.
**Audio**: "Our deterministic matching engine reconciled 96.4% of records in milliseconds. But look here — ₹10.3 Lakhs are unresolved. We don't hide failures; we highlight them."

### [1:30-2:15] Exceptions
**Visual**: Click on the Exceptions tab. Click on a critical exception. The drawer opens showing the AI summary, the transaction timeline, and the evidence trail.
**Audio**: "Clicking an exception gives us the full story. The timeline shows when the order was placed and when Razorpay settled it, but the bank credit is missing. The AI investigated and summarized exactly what went wrong."

### [2:15-2:45] Ask Your Books
**Visual**: Open the 'Ask Your Books' chat panel. Type: "Why was settlement PAY-00001 lower?" The AI returns a variance breakdown.
**Audio**: "Have a question? Just ask your books. 'Why was I paid less?' The AI uses tools to fetch real data, rendering a variance breakdown chart, showing exact fee deductions down to the rupee. No hallucinations."

### [2:45-3:15] Cash Position
**Visual**: Navigate to the Cash Position tab. Show the historical trend and 7-day forecast. Then simulate a 3-day settlement delay.
**Audio**: "Finora also forecasts your cash position. Here's our holiday-adjusted 7-day projection. But what if Razorpay delays settlements by 3 days? Our What-If simulator instantly recalculates your risk level."

### [3:15-3:45] The Verifier
**Visual**: In the chat panel, type: "What happened in 2025?". Show the terminal logs where the Verifier rejects a hallucinated answer and forces a fallback.
**Audio**: "What makes Finora different is trust. If you ask a trick question, our Verifier intercepts the AI, checks its tool usage, and blocks hallucinations. If it doesn't have the data, it admits it."

### [3:45-4:15] Value-Weighted Metrics
**Visual**: Show the Month-End Close / Settings page highlighting the Value-Weighted metrics.
**Audio**: "We measure success by value, not just row counts. Your record match rate might be 96%, but your value reconciled is 99.2%. You instantly know your true financial exposure."

### [4:15-4:45] Architecture
**Visual**: Show the Architecture diagram from the README.
**Audio**: "Under the hood, a deterministic engine makes the hard decisions. Gemma 3 acts as the communication layer to explain those decisions. And a strict Verifier keeps the AI honest. Plus, everything runs locally—your data never leaves your machine."

### [4:45-5:00] Closing
**Visual**: Fade out with the Finora logo and tagline.
**Audio**: "Finora — where AI explains financial truth, instead of guessing it."
