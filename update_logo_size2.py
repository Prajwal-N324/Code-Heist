import glob
import os

dir_path = r"c:\Users\PRAJWAL SHETTY\OneDrive\Desktop\Code Hesit"
html_files = glob.glob(os.path.join(dir_path, "*.html"))

for f in html_files:
    try:
        with open(f, 'r', encoding='utf-8', errors='ignore') as file:
            content = file.read()
        
        modified = False
        
        # Increase the right logo width to 90px (matching or close to left logo's 95px, actually circle logos often look slightly bigger at same px width, let's use 95px for exact match)
        new_content = content.replace(".ch-logo-top-right { right: 20px; }", ".ch-logo-top-right { right: 20px; width: 95px; }")
        
        # Also clean up the mobile queries if needed
        # We previously set .ch-logo-top-left { width: 75px; }. We should just add .ch-logo-top-right { width: 75px; } next to it.
        if ".ch-logo-top-right { width: 75px; }" not in new_content:
            new_content = new_content.replace(".ch-logo-top-left { width: 75px; }", ".ch-logo-top-left { width: 75px; }\n    .ch-logo-top-right { width: 75px; }")
        
        # And just in case we hadn't replaced left width properly everywhere
        new_content = new_content.replace(".ch-logo-top-left { left: 20px; width: 70px; }", ".ch-logo-top-left { left: 20px; width: 95px; }")
        
        if new_content != content:
            modified = True
            
        if modified:
            with open(f, 'w', encoding='utf-8') as file:
                file.write(new_content)
            print(f"Modified {f}")
    except Exception as e:
        print(f"Error processing {f}: {e}")
