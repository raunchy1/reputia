# Builds the "reputia" wordmark from Host Grotesk outlines (OFL), with custom tracking and the i-dot removed.
import sys, json
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.recordingPen import DecomposingRecordingPen
from fontTools.pens.boundsPen import BoundsPen

src, weight, tracking, out = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), sys.argv[4]
font = instantiateVariableFont(TTFont(src), {"wght": weight})
gs = font.getGlyphSet(); cmap = font.getBestCmap(); hmtx = font["hmtx"]
text = "reputia"
x = 0; parts = []; idot = None
for ch in text:
    name = cmap[ord(ch)]
    rec = DecomposingRecordingPen(gs); gs[name].draw(rec)
    # split into contours
    contours, cur = [], []
    for op, args in rec.value:
        cur.append((op, args))
        if op in ("closePath", "endPath"):
            contours.append(cur); cur = []
    if ch == "i":
        # drop the dot: the contour with the highest minimum y
        def bounds(c):
            bp = BoundsPen(gs)
            for op, args in c: getattr(bp, op)(*args)
            return bp.bounds
        bs = [bounds(c) for c in contours]
        top = max(range(len(contours)), key=lambda k: bs[k][1])
        b = bs[top]; idot = {"cx": x + (b[0] + b[2]) / 2, "cy": (b[1] + b[3]) / 2, "r": (b[2] - b[0]) / 2}
        contours = [c for k, c in enumerate(contours) if k != top]
    pen = SVGPathPen(gs)
    for c in contours:
        for op, args in c: getattr(pen, op)(*args)
    parts.append(f'<path transform="translate({x:.1f} 0)" d="{pen.getCommands()}"/>')
    x += hmtx[name][0] + tracking
width = x - tracking
json.dump({"paths": parts, "width": width, "idot": idot, "xHeight": font["OS/2"].sxHeight, "cap": font["OS/2"].sCapHeight}, open(out, "w"))
print(out, round(width), idot)
