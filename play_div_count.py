from pathlib import Path
path = Path('pages/play.js')
text = path.read_text(encoding='utf8')
lines = text.splitlines()
start = next(i for i, line in enumerate(lines) if '<main className="page-shell play-shell"' in line)
open_count = 0
close_count = 0
for i in range(start, len(lines)):
    line = lines[i]
    opens = line.count('<div')
    closes = line.count('</div>')
    open_count += opens
    close_count += closes
    if opens or closes:
        print(i+1, opens, closes, open_count-close_count, repr(line))
    if line.strip() == '</main>':
        break
print('FINAL', open_count, close_count, open_count-close_count)
