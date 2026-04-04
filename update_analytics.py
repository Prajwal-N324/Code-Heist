import glob
import os

dir_path = r"c:\Users\PRAJWAL SHETTY\OneDrive\Desktop\Code Hesit"
html_files = glob.glob(os.path.join(dir_path, "*.html"))

analytics_script = """
    <!-- Vercel Analytics -->
    <script defer src="/_vercel/insights/script.js"></script>
"""

for f in html_files:
    try:
        with open(f, 'r', encoding='utf-8', errors='ignore') as file:
            content = file.read()
        
        if "/_vercel/insights/script.js" not in content:
            new_content = content.replace("</head>", f"{analytics_script}\n</head>")
            with open(f, 'w', encoding='utf-8') as file:
                file.write(new_content)
            print(f"Added Analytics to {f}")
    except Exception as e:
        print(f"Error processing {f}: {e}")
