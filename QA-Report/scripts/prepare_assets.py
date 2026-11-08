"""Builds the summary graphs and prepares screenshots for the QA report from report-data.json."""
import json, sys
from collections import Counter
from pathlib import Path
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

root = Path(__file__).resolve().parent.parent
data = json.loads((root / "report-data.json").read_text(encoding="utf-8"))
out = root / "build"
out.mkdir(exist_ok=True)
bugs = data["bugs"]

ORDER = ["Critical", "High", "Medium", "Low"]
COLORS = {"Critical": "#B42318", "High": "#E8590C", "Medium": "#D4A017", "Low": "#5B8DB8"}

def style(ax, title):
    ax.set_title(title, fontsize=13, fontweight="bold", loc="left", pad=12)
    for s in ("top", "right"):
        ax.spines[s].set_visible(False)
    ax.yaxis.grid(True, color="#e5e5e5"); ax.set_axisbelow(True)

# 1. Bugs by severity
sev = Counter(b["severity"] for b in bugs)
fig, ax = plt.subplots(figsize=(7, 3.6), dpi=200)
vals = [sev.get(s, 0) for s in ORDER]
bars = ax.bar(ORDER, vals, color=[COLORS[s] for s in ORDER], width=0.6)
for b, v in zip(bars, vals):
    ax.annotate(str(v), (b.get_x() + b.get_width() / 2, v), ha="center", va="bottom", fontsize=10, xytext=(0, 3), textcoords="offset points")
ax.set_ylabel("Number of bugs")
ax.yaxis.set_major_locator(matplotlib.ticker.MaxNLocator(integer=True))
style(ax, "Bugs by severity")
fig.tight_layout(); fig.savefig(out / "chart-severity.png"); plt.close(fig)

# 2. Bugs by module
mod = Counter(b["module"] if not b["module"].startswith("[PLACEHOLDER") else "Module (placeholder)" for b in bugs)
items = sorted(mod.items(), key=lambda kv: kv[1])
fig, ax = plt.subplots(figsize=(7, max(2.4, 0.45 * len(items) + 1.2)), dpi=200)
ax.barh([k for k, _ in items], [v for _, v in items], color="#3A5A80", height=0.6)
ax.set_xlabel("Number of bugs")
ax.xaxis.set_major_locator(matplotlib.ticker.MaxNLocator(integer=True))
style(ax, "Bugs by module")
ax.yaxis.grid(False); ax.xaxis.grid(True, color="#e5e5e5")
fig.tight_layout(); fig.savefig(out / "chart-module.png"); plt.close(fig)
print("charts written to", out)

# 3. Screenshots -> PNG copies (so the Word builder can embed any image type)
from PIL import Image
shots_out = out / "screenshots"; shots_out.mkdir(exist_ok=True)
for b in bugs:
    for s in b.get("screenshots", []):
        src = root / "screenshots" / s
        if not src.exists():
            print(f"WARNING: {b['id']} screenshot not found: {src}", file=sys.stderr); continue
        Image.open(src).convert("RGB").save(shots_out / (Path(s).stem + ".png"))
print("screenshots prepared")
