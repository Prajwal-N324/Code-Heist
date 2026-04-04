import glob
import os

dir_path = r"c:\Users\PRAJWAL SHETTY\OneDrive\Desktop\Code Hesit"
html_files = glob.glob(os.path.join(dir_path, "*.html"))

for f in html_files:
    try:
        with open(f, 'r', encoding='utf-8', errors='ignore') as file:
            content = file.read()
        
        modified = False
        
        new_content = content.replace(".ch-logo-top-right { right: 20px; width: 125px; }", ".ch-logo-top-right { right: 20px; width: 110px; }")
        
        if new_content != content:
            modified = True
            
        if modified:
            with open(f, 'w', encoding='utf-8') as file:
                file.write(new_content)
            print(f"Modified {f}")
    except Exception as e:
        print(f"Error processing {f}: {e}")
