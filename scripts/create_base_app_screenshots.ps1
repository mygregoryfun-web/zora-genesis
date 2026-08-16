$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$OutDir = Join-Path (Get-Location) "output\base-app"
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

$W = 1284
$H = 2778

function Color($hex) {
  $hex = $hex.TrimStart("#")
  return [System.Drawing.Color]::FromArgb(
    [Convert]::ToInt32($hex.Substring(0, 2), 16),
    [Convert]::ToInt32($hex.Substring(2, 2), 16),
    [Convert]::ToInt32($hex.Substring(4, 2), 16)
  )
}

function Font($size, $style = [System.Drawing.FontStyle]::Regular) {
  return New-Object System.Drawing.Font("Segoe UI", $size, $style, [System.Drawing.GraphicsUnit]::Pixel)
}

function RoundedPath($x, $y, $w, $h, $r) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $r * 2
  $path.AddArc($x, $y, $d, $d, 180, 90)
  $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $path.CloseFigure()
  return $path
}

function FillRound($g, $x, $y, $w, $h, $r, $fill, $stroke = $null, $strokeWidth = 2) {
  $path = RoundedPath $x $y $w $h $r
  $brush = New-Object System.Drawing.SolidBrush($fill)
  $g.FillPath($brush, $path)
  $brush.Dispose()
  if ($stroke) {
    $pen = New-Object System.Drawing.Pen($stroke, $strokeWidth)
    $g.DrawPath($pen, $path)
    $pen.Dispose()
  }
  $path.Dispose()
}

function DrawText($g, $text, $x, $y, $w, $font, $color, $lineHeight = 1.25) {
  $brush = New-Object System.Drawing.SolidBrush($color)
  $format = New-Object System.Drawing.StringFormat
  $format.Trimming = [System.Drawing.StringTrimming]::Word
  $format.FormatFlags = 0
  $rect = New-Object System.Drawing.RectangleF($x, $y, $w, 2000)
  $g.DrawString($text, $font, $brush, $rect, $format)
  $measured = $g.MeasureString($text, $font, [int]$w, $format)
  $brush.Dispose()
  $format.Dispose()
  return [int]($measured.Height * $lineHeight)
}

function DrawPill($g, $text, $x, $y, $font, $fg, $bg) {
  $size = $g.MeasureString($text, $font)
  $padX = 26
  $padY = 12
  FillRound $g $x $y ([int]$size.Width + $padX * 2) ([int]$size.Height + $padY * 2) 28 $bg
  $brush = New-Object System.Drawing.SolidBrush($fg)
  $g.DrawString($text, $font, $brush, $x + $padX, $y + $padY)
  $brush.Dispose()
}

function DrawHeader($g, $title, $subtitle) {
  FillRound $g 64 64 1156 142 34 (Color "#ffffff") (Color "#d9e2f2") 2
  FillRound $g 96 94 74 74 18 (Color "#0052ff")
  DrawText $g "ZG" 112 106 60 (Font 30 ([System.Drawing.FontStyle]::Bold)) (Color "#ffffff") | Out-Null
  DrawText $g $title 194 88 620 (Font 38 ([System.Drawing.FontStyle]::Bold)) (Color "#10151f") | Out-Null
  DrawText $g $subtitle 196 137 760 (Font 22) (Color "#637083") | Out-Null
  DrawPill $g "Base + Zora" 964 103 (Font 20 ([System.Drawing.FontStyle]::Bold)) (Color "#0052ff") (Color "#eaf0ff")
}

function DrawPhoneChrome($g) {
  FillRound $g 52 42 1180 2694 58 (Color "#f5f7fb") (Color "#c9d4e5") 4
  FillRound $g 542 78 200 20 10 (Color "#17202e")
}

function DrawMetric($g, $label, $value, $x, $y, $w, $accent) {
  FillRound $g $x $y $w 166 26 (Color "#ffffff") (Color "#d9e2f2") 2
  DrawText $g $label ($x + 28) ($y + 28) ($w - 56) (Font 22) (Color "#637083") | Out-Null
  DrawText $g $value ($x + 28) ($y + 72) ($w - 56) (Font 38 ([System.Drawing.FontStyle]::Bold)) $accent | Out-Null
}

function DrawCard($g, $tag, $title, $body, $x, $y, $w, $h, $accent) {
  FillRound $g $x $y $w $h 30 (Color "#ffffff") (Color "#d9e2f2") 2
  DrawPill $g $tag ($x + 28) ($y + 28) (Font 18 ([System.Drawing.FontStyle]::Bold)) $accent (Color "#eef3ff")
  DrawText $g $title ($x + 28) ($y + 92) ($w - 56) (Font 34 ([System.Drawing.FontStyle]::Bold)) (Color "#10151f") | Out-Null
  DrawText $g $body ($x + 28) ($y + 150) ($w - 56) (Font 24) (Color "#596579") | Out-Null
}

function NewCanvas($path) {
  $bmp = New-Object System.Drawing.Bitmap($W, $H)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
  $g.Clear((Color "#eef3fb"))
  DrawPhoneChrome $g
  return @{ Bitmap = $bmp; Graphics = $g; Path = $path }
}

function SaveCanvas($canvas) {
  $canvas.Graphics.Dispose()
  $canvas.Bitmap.Save($canvas.Path, [System.Drawing.Imaging.ImageFormat]::Png)
  $canvas.Bitmap.Dispose()
}

function ScreenshotOverview {
  $path = Join-Path $OutDir "01-zora-genesis-overview.png"
  $c = NewCanvas $path
  $g = $c.Graphics
  DrawHeader $g "Zora Genesis" "AI agent for creator assets"

  DrawText $g "AI agent for Base creator asset discovery." 96 290 1010 (Font 72 ([System.Drawing.FontStyle]::Bold)) (Color "#10151f") 1.08 | Out-Null
  DrawText $g "Tracks Base and Zora signals, scores new asset opportunities, creates images, and prepares channel-ready posts." 100 520 1020 (Font 30) (Color "#596579") | Out-Null

  DrawMetric $g "Network" "Base" 96 720 330 (Color "#0052ff")
  DrawMetric $g "Status" "Live" 476 720 330 (Color "#11845b")
  DrawMetric $g "Mode" "Guarded" 856 720 330 (Color "#b26b00")

  DrawCard $g "New asset creation" "Creator asset pulse" "Turns Base attention into collectible Zora-ready briefs and market notes." 96 960 1090 300 (Color "#0052ff")
  DrawCard $g "Consumer apps" "Discovery feed" "Ranks cultural relevance and creator activity for easier onchain asset discovery." 96 1310 1090 300 (Color "#7c3aed")
  DrawCard $g "Agent publishing" "Preview, approve, publish" "Creates channel-specific drafts for X, Farcaster, and Zora with safe controls." 96 1660 1090 300 (Color "#11845b")

  FillRound $g 96 2108 1090 356 34 (Color "#10151f")
  DrawText $g "Live endpoints" 132 2144 980 (Font 34 ([System.Drawing.FontStyle]::Bold)) (Color "#ffffff") | Out-Null
  DrawText $g "/agent/profile    /agent/opportunities    /health" 132 2210 980 (Font 28) (Color "#d9e7ff") | Out-Null
  DrawText $g "Built for Base builders, Zora creators, and creator economy workflows." 132 2300 980 (Font 27) (Color "#b8c7dc") | Out-Null

  SaveCanvas $c
}

function ScreenshotOpportunities {
  $path = Join-Path $OutDir "02-opportunity-radar.png"
  $c = NewCanvas $path
  $g = $c.Graphics
  DrawHeader $g "Opportunity Radar" "Signals into creator asset ideas"

  DrawText $g "Narrative radar for Base attention spikes." 96 290 1030 (Font 68 ([System.Drawing.FontStyle]::Bold)) (Color "#10151f") 1.08 | Out-Null
  DrawText $g "Prediction-market narratives, Zora mint activity, creator economy signals, and Base builder focus become ranked opportunities." 100 520 1020 (Font 30) (Color "#596579") | Out-Null

  DrawMetric $g "Top score" "92" 96 720 330 (Color "#0052ff")
  DrawMetric $g "Radar" "84" 476 720 330 (Color "#7c3aed")
  DrawMetric $g "Risk" "Safe" 856 720 330 (Color "#11845b")

  DrawCard $g "Score 92" "Zora asset pulse" "Base builder focus is leaning toward new asset creation while Zora creator activity is active." 96 960 1090 330 (Color "#0052ff")
  DrawCard $g "Score 87" "Launchpad-lite flow" "A guided flow from idea to image, metadata, launch post, and distribution checklist." 96 1340 1090 330 (Color "#11845b")
  DrawCard $g "Score 84" "Prediction-market narrative radar" "Uses Base attention spikes as a signal layer for creator assets, not as trading advice." 96 1720 1090 360 (Color "#7c3aed")

  FillRound $g 96 2228 1090 260 34 (Color "#fff7ed") (Color "#fed7aa") 2
  DrawText $g "Safety boundary" 132 2264 960 (Font 32 ([System.Drawing.FontStyle]::Bold)) (Color "#9a3412") | Out-Null
  DrawText $g "Observation only: no leverage guidance, price targets, liquidations, or autonomous trading." 132 2324 960 (Font 27) (Color "#7c2d12") | Out-Null

  SaveCanvas $c
}

function ScreenshotPublishing {
  $path = Join-Path $OutDir "03-publishing-flow.png"
  $c = NewCanvas $path
  $g = $c.Graphics
  DrawHeader $g "Publishing Flow" "Channel-ready drafts"

  DrawText $g "From signal to post to Zora-ready brief." 96 290 1030 (Font 68 ([System.Drawing.FontStyle]::Bold)) (Color "#10151f") 1.08 | Out-Null
  DrawText $g "The agent creates different output for each channel so X stays concise, Farcaster stays builder-native, and Zora becomes asset-ready." 100 520 1020 (Font 30) (Color "#596579") | Out-Null

  DrawCard $g "X preview" "Creator asset pulse" "Base and Zora signals are condensed into a short post with fewer hashtags and a concrete product angle." 96 760 1090 330 (Color "#10151f")
  DrawCard $g "Farcaster" "Builder note" "A practical ecosystem observation for builders and creators, with embeds when images are available." 96 1140 1090 330 (Color "#7c3aed")
  DrawCard $g "Zora" "Asset-ready brief" "Transforms the same signal into a collectible creator-market explainer with image and metadata flow." 96 1520 1090 350 (Color "#0052ff")

  FillRound $g 96 2030 1090 386 34 (Color "#ecfdf5") (Color "#bbf7d0") 2
  DrawText $g "Safe by default" 132 2070 960 (Font 36 ([System.Drawing.FontStyle]::Bold)) (Color "#166534") | Out-Null
  DrawText $g "Preview commands do not publish. Live publishing is separated by channel: publish:x, publish:farcaster, publish:zora." 132 2144 960 (Font 28) (Color "#14532d") | Out-Null
  DrawText $g "SKIP_POST controls protect accidental posting during tests." 132 2255 960 (Font 27) (Color "#14532d") | Out-Null

  SaveCanvas $c
}

ScreenshotOverview
ScreenshotOpportunities
ScreenshotPublishing

Get-ChildItem $OutDir -Filter "*.png" | Select-Object FullName, Length
