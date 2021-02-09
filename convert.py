import base64

with open("cover-page.html", "rb") as fh:
    text = fh.read()

text = base64.b64encode(text).decode("utf8")

with open("template.html", "rt") as fh:
    html = fh.read()

html = html.replace("${TEMPLATE}", text)
    
with open("index.html", "wt") as fh:
    fh.write(html)
