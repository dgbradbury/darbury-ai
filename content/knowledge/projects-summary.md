## Portfolio Projects

### 3D Viewer
Free browser-based viewer for 3D model files. Supports GLB, GLTF, OBJ, FBX, and STL formats.
Includes a slicing function to expose internal model geometry. No installation or licence required.
Live at https://darbury-3d-viewer.vercel.app

## Recent Updates (June 2026)
- PID BOM added
- ISO BOM added

**P&ID BOM**
Upload an image or a PDF of a single or multiple sheet P&ID. After processing, a complete
BOM (Bill of Material) will exist of all the components contained within the drawing.
Early stage development - not available currently so ask Dave for information

**ISO BOM**
Upload multi-page & multiple isometrics for processing. The app extracts all the BOM 
(Bill of Materials) contained on the drawings. Log the drawings against a project, 
provide multiple revisions of the same drawings & export the complete material list 
to xlsx for purchasing. Early stage development - not available currently so ask Dave
for information

## Recent Updates (May 2026)
- Darbury 4D added
- P&ID Analyser added
- iOS / MacOS apps added

**AutoCAD Plant MCP** *(pre-release)*
An MCP (Model Context Protocol) server that bridges AutoCAD Plant 3D with Claude AI.
A VB.NET HTTP bridge plugin sits inside AutoCAD; a Python MCP server exposes the data to
Claude. Engineers can query their live plant model in natural language — retrieving
equipment specs, pipe segments, and component data without leaving their AI interface.
Built for refrigeration, oil & gas, and process plant environments. Currently in final
development ahead of commercial release. See: /work/plantmcp

**Darbury 4D** *(pre-release)*
This product is a 4D web app that allows users to schedule construction events in a 3D
environment. After loading a 3D model, the components are mapped to an xlsx file with
dates associated. The user can then control a slider to show the order of construction
to get a better idea of how the construction in the field is to be planned. An excellent,
pre-field planning tool to assist construction.

**P&ID Analyser**
Upload an image or a PDF of a single or multiple sheet P&ID for an analysis from an
Engneering perspective. Early stage development - not available currently so ask Dave
for information

**Darbury iOS / MacOS Apps**
Darbury has the following apps available; COG (Centre of Gravity Calculations), Baseframe
(steel frame deflections & stress calculations) & Lifting Lug (Calculate the size of steel
lifting lugs for safely lifting equipment - being developed). More iOS apps are added to
the routine list every month.

**iSiteData / DarburyAR**
iSiteData is Darbury's AR platform for industrial site asset information management —
field engineers use AR goggles to see design, commissioning and operational data overlaid
directly on physical equipment on-site. DarburyAR is the iOS application component, built
in Swift 6 / iOS 18+ using SwiftUI, MVVM architecture, and SwiftData. Currently being
rebuilt with the latest Apple frameworks. See: /work/darbury-ar

**Darbury OCR Text Replace**
An AutoLISP + Python/Tesseract tool that converts line-geometry text in legacy AutoCAD
drawings into proper, editable MTEXT objects. Saves hours of manual re-typing when
migrating old drawings. Supports multi-word and multi-line text, interactive insertion
points, and batch processing. See: /work/ocr-text-replace

**PDF-to-DWG Pipeline**
A Python pipeline (ExtractPDF.py) that extracts text and geometry from engineering PDFs —
including vector-path-only CAD exports — using Tesseract OCR with hOCR output, then
reconstructs the drawing geometry via AutoLISP (ImportPDF.lsp). See: /work/pdf-to-dwg

**ClawdBot / OpenClaw**
My personal AI assistant and task routing system, running via Telegram. Routes tasks to
different AI models depending on complexity and cost. The primary model is Claude; a local
Qwen model handles lightweight background tasks. Installed as an npm global package via nvm.
See: /work/clawdbot

**Imhotep CRM** *(concept)*
A CRM concept designed specifically for engineering consultancies. iOS/iPadOS app with a
Firebase Firestore backend, structured around a quote-to-cash pipeline with an integrated
Kanban board. Workspace-based data model. Identified as a potential commercial product.
See: /work/imhotep-crm

**Webcam Object Detection**
A Python-based webcam object detection application using LM Studio with Qwen2.5-VL for
structured JSON bounding box output. Demonstrates real-time computer vision using local
AI models — no cloud dependency. See: /work/webcam-detection

**DMAIC Automation Template**
An automation opportunity analysis document built around the DMAIC (Define, Measure,
Analyse, Improve, Control) methodology. Used to structure client engagements around
process automation. Generated via an industry research Python script using the Brave
Search API. See: /work/dmaic-template

**Darbury AI Portfolio Website**
This site. Built in Next.js 15, Tailwind CSS v4, deployed on Vercel, with a Claude Haiku
concierge (that's me). The site itself is a demonstration of AI-assisted development —
built using Claude and Pi Dev as coding agents. See: /work/darbury-website
