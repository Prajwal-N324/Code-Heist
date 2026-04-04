import glob
import os
import re
import shutil

src1 = r"C:\Users\PRAJWAL SHETTY\OneDrive\Desktop\Picsart_26-03-31_19-42-44-174.png"
src2 = r"C:\Users\PRAJWAL SHETTY\OneDrive\Desktop\Picsart_26-03-31_19-34-47-358.png"

dirs = [
    r"c:\Users\PRAJWAL SHETTY\OneDrive\Desktop\Code Hesit",
    r"c:\Users\PRAJWAL SHETTY\OneDrive\Desktop"
]

# Copy logos to Code Hesit directory
try:
    if os.path.exists(src1):
        shutil.copy(src1, r"c:\Users\PRAJWAL SHETTY\OneDrive\Desktop\Code Hesit\vigyan_logo.png")
    if os.path.exists(src2):
        shutil.copy(src2, r"c:\Users\PRAJWAL SHETTY\OneDrive\Desktop\Code Hesit\a_logo.png")
except Exception as e:
    print("Could not copy images:", e)


admin_html_additions = """
<div class="laser-grid">
  <div class="grid-floor"></div>
  <div class="grid-ceil"></div>
  <div class="laser-sweep"></div>
  <div class="laser-sweep"></div>
  <div class="laser-sweep"></div>
  <div class="laser-h"></div>
  <div class="laser-h"></div>
</div>
<div class="glow-center"></div>
<div class="glow-amber"></div>
<div class="skyline"></div>
<div class="particles">
  <div class="particle"></div><div class="particle"></div><div class="particle"></div>
  <div class="particle"></div><div class="particle"></div><div class="particle"></div>
</div>
"""

admin_css = """
/* Laser grid */
.laser-grid{position:fixed;inset:0;z-index:0;pointer-events:none;perspective:500px;overflow:hidden}
.grid-floor{position:absolute;bottom:0;left:-50%;width:200%;height:80%;transform:rotateX(65deg);transform-origin:bottom center;background-image:linear-gradient(rgba(0,230,118,0.13) 1px,transparent 1px),linear-gradient(90deg,rgba(0,230,118,0.13) 1px,transparent 1px);background-size:60px 60px;animation:grid-scroll 5s linear infinite;mask-image:linear-gradient(to top,rgba(0,0,0,0.6) 0%,rgba(0,0,0,0.2) 40%,transparent 75%)}
@keyframes grid-scroll{0%{background-position:0 0}100%{background-position:0 60px}}
.grid-ceil{position:absolute;top:0;left:-50%;width:200%;height:55%;transform:rotateX(-65deg);transform-origin:top center;background-image:linear-gradient(rgba(255,171,64,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,171,64,0.06) 1px,transparent 1px);background-size:60px 60px;animation:grid-scroll 6s linear infinite;mask-image:linear-gradient(to bottom,rgba(0,0,0,0.4) 0%,rgba(0,0,0,0.1) 40%,transparent 75%)}
.laser-sweep{position:absolute;top:0;bottom:0;width:2px;background:linear-gradient(180deg,transparent 0%,rgba(0,230,118,0.5) 40%,rgba(0,230,118,0.8) 50%,rgba(0,230,118,0.5) 60%,transparent 100%);filter:blur(1px);animation:laser-move linear infinite;opacity:0}
.laser-sweep:nth-child(3){animation-duration:8s;animation-delay:0s;left:0}
.laser-sweep:nth-child(4){animation-duration:11s;animation-delay:3.5s;left:0;background:linear-gradient(180deg,transparent,rgba(255,171,64,0.35),rgba(255,171,64,0.6),rgba(255,171,64,0.35),transparent)}
.laser-sweep:nth-child(5){animation-duration:9s;animation-delay:6s;left:0}
@keyframes laser-move{0%{left:-2px;opacity:0}5%{opacity:1}95%{opacity:1}100%{left:100%;opacity:0}}
.laser-h{position:absolute;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(0,230,118,0.4),rgba(0,230,118,0.7),rgba(0,230,118,0.4),transparent);filter:blur(1px);animation:laser-h-move linear infinite;opacity:0}
.laser-h:nth-child(6){animation-duration:12s;animation-delay:1s;top:0}
.laser-h:nth-child(7){animation-duration:15s;animation-delay:7s;top:0;background:linear-gradient(90deg,transparent,rgba(255,171,64,0.25),rgba(255,171,64,0.5),rgba(255,171,64,0.25),transparent)}
@keyframes laser-h-move{0%{top:-2px;opacity:0}5%{opacity:1}95%{opacity:1}100%{top:100%;opacity:0}}

.glow-center{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:650px;height:650px;pointer-events:none;z-index:1;background:radial-gradient(ellipse at center,rgba(0,230,118,.07) 0%,rgba(0,100,60,.02) 45%,transparent 70%);animation:pglow 5s ease-in-out infinite}
.glow-amber{position:fixed;top:10%;right:5%;width:300px;height:300px;pointer-events:none;z-index:1;background:radial-gradient(circle,rgba(255,171,64,.055) 0%,transparent 65%);animation:pglow2 8s ease-in-out infinite}
@keyframes pglow{0%,100%{opacity:.5;transform:translate(-50%,-50%) scale(1)}50%{opacity:1;transform:translate(-50%,-50%) scale(1.1)}}
@keyframes pglow2{0%,100%{opacity:.3;transform:scale(1)}50%{opacity:.7;transform:scale(1.15)}}

.skyline{position:fixed;bottom:0;left:0;right:0;height:32vh;pointer-events:none;z-index:2;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 280' preserveAspectRatio='xMidYMax slice'%3E%3Cg fill='%23040908'%3E%3Crect x='0' y='140' width='60' height='140'/%3E%3Crect x='30' y='100' width='40' height='180'/%3E%3Crect x='80' y='120' width='50' height='160'/%3E%3Crect x='140' y='80' width='30' height='200'/%3E%3Crect x='150' y='60' width='15' height='220'/%3E%3Crect x='180' y='130' width='70' height='150'/%3E%3Crect x='260' y='90' width='45' height='190'/%3E%3Crect x='315' y='110' width='35' height='170'/%3E%3Crect x='360' y='70' width='55' height='210'/%3E%3Crect x='430' y='100' width='65' height='180'/%3E%3Crect x='510' y='120' width='40' height='160'/%3E%3Crect x='600' y='60' width='50' height='220'/%3E%3Crect x='715' y='90' width='60' height='190'/%3E%3Crect x='830' y='100' width='55' height='180'/%3E%3Crect x='945' y='80' width='50' height='200'/%3E%3Crect x='1120' y='60' width='45' height='220'/%3E%3Crect x='1290' y='100' width='60' height='180'/%3E%3C/g%3E%3Cg fill='%2300e676' opacity='0.2'%3E%3Crect x='154' y='52' width='4' height='8'/%3E%3Crect x='373' y='32' width='4' height='8'/%3E%3Crect x='603' y='52' width='4' height='8'/%3E%3C/g%3E%3C/svg%3E") no-repeat bottom;background-size:cover;opacity:0.75}

.particles{position:fixed;inset:0;pointer-events:none;overflow:hidden;z-index:3}
.particle{position:absolute;width:2px;height:2px;border-radius:50%;background:var(--green);opacity:0;animation:float-up linear infinite}
.particle:nth-child(1){left:8%;animation-duration:13s;animation-delay:0s}
.particle:nth-child(2){left:22%;animation-duration:16s;animation-delay:4s;background:var(--amber);width:3px;height:3px}
.particle:nth-child(3){left:38%;animation-duration:11s;animation-delay:1.5s}
.particle:nth-child(4){left:55%;animation-duration:14s;animation-delay:6s;background:var(--blue)}
.particle:nth-child(5){left:72%;animation-duration:12s;animation-delay:2.5s}
.particle:nth-child(6){left:90%;animation-duration:15s;animation-delay:8s;background:var(--amber)}
@keyframes float-up{0%{transform:translateY(100vh) scale(0);opacity:0}10%{opacity:0.7}90%{opacity:0.2}100%{transform:translateY(-5vh) scale(1.5);opacity:0}}
"""

logos_css = """
<style>
.ch-logo-top-left, .ch-logo-top-right {
    position: fixed;
    top: 20px;
    width: 60px;
    height: auto;
    z-index: 9999;
    filter: drop-shadow(0 0 10px rgba(0, 230, 118, 0.4));
    opacity: 0.9;
}
.ch-logo-top-left { left: 20px; width: 70px; }
.ch-logo-top-right { right: 20px; }
@media (max-width: 600px) {
    .ch-logo-top-left, .ch-logo-top-right { width: 45px; }
    .ch-logo-top-left { width: 55px; }
}
</style>
"""

vigyan_append = """<br><span style="display:block; font-size:0.5em; line-height:1.2; margin-top:8px; font-weight:700; letter-spacing:4px;">VIGYAN.IO</span>"""

for d in dirs:
    html_files = glob.glob(os.path.join(d, "*.html"))
    for f in html_files:
        try:
            with open(f, 'r', encoding='utf-8', errors='ignore') as file:
                content = file.read()
            
            if "CODE HEIST" not in content:
                continue
                
            modified = False
            
            # Use relative paths: if parsing in Desktop vs Code Hesit
            image_dir_prefix = "Code Hesit/" if os.path.basename(d) == "Desktop" else ""
            
            # 1. Add VIGYAN.IO exactly after CODE HEIST
            if ">CODE HEIST</div>" in content and "VIGYAN.IO" not in content:
                content = content.replace(">CODE HEIST</div>", f">CODE HEIST{vigyan_append}</div>")
                modified = True
                
            # 2. Add logos if not present
            if "ch-logo-top-left" not in content:
                logos_html = f"""
<img class="ch-logo-top-left" src="{image_dir_prefix}vigyan_logo.png" alt="Vigyan.IO Logo">
<img class="ch-logo-top-right" src="{image_dir_prefix}a_logo.png" alt="A Logo">
"""
                if "<body>" in content:
                    content = content.replace("<body>", f"<body>\n{logos_html}")
                    modified = True
                if "</head>" in content:
                    content = content.replace("</head>", f"{logos_css}\n</head>")
                    modified = True
                    
            # 3. Add admin bg animations if it's admin file
            if "admin" in os.path.basename(f).lower() and "laser-grid" not in content:
                if "<body>" in content:
                    content = content.replace("<body>", f"<body>\n{admin_html_additions}")
                    modified = True
                if "</style>" in content:
                    content = content.replace("</style>", f"{admin_css}\n</style>")
                    content = re.sub(r'\.bg-scene\{.*?\}', '.bg-scene{display:none;}', content, flags=re.DOTALL)
                    modified = True

            if modified:
                with open(f, 'w', encoding='utf-8') as file:
                    file.write(content)
                print(f"Modified {f}")
        except Exception as e:
            print(f"Failed to modify {f}: {e}")
