"""Opens the .docx in headless LibreOffice, updates the Table of Contents and page fields, and exports a PDF next to it."""
import os, subprocess, sys, time, tempfile
import uno
from com.sun.star.beans import PropertyValue

def prop(name, value):
    p = PropertyValue(); p.Name = name; p.Value = value; return p

src = os.path.abspath(sys.argv[1])
pdf = os.path.splitext(src)[0] + ".pdf"
profile = tempfile.mkdtemp(prefix="lo-profile-")
port = 2002 + os.getpid() % 1000
proc = subprocess.Popen(["soffice", "--headless", "--invisible", "--nologo", "--norestore",
                         f"-env:UserInstallation=file://{profile}",
                         f"--accept=socket,host=127.0.0.1,port={port};urp;"],
                        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
try:
    local = uno.getComponentContext()
    resolver = local.ServiceManager.createInstanceWithContext("com.sun.star.bridge.UnoUrlResolver", local)
    for _ in range(60):
        try:
            ctx = resolver.resolve(f"uno:socket,host=127.0.0.1,port={port};urp;StarOffice.ComponentContext"); break
        except Exception:
            time.sleep(0.5)
    else:
        sys.exit("Could not start LibreOffice")
    desktop = ctx.ServiceManager.createInstanceWithContext("com.sun.star.frame.Desktop", ctx)
    doc = desktop.loadComponentFromURL(uno.systemPathToFileUrl(src), "_blank", 0, (prop("Hidden", True),))
    idx = doc.getDocumentIndexes()
    for i in range(idx.getCount()):
        idx.getByIndex(i).update()
    doc.refresh()
    for i in range(idx.getCount()):   # second pass: page numbers settle after the TOC itself takes space
        idx.getByIndex(i).update()
    doc.storeToURL(uno.systemPathToFileUrl(pdf), (prop("FilterName", "writer_pdf_Export"),))
    doc.close(True)
    print("PDF file:", pdf)
finally:
    proc.terminate()
