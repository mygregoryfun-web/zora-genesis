$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$OutDir = Join-Path (Get-Location) "output\base-app"
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

$W = 1200
$H = 628
$Path = Join-Path $OutDir "zora-genesis-thumbnail.png"

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

function DrawText($g, $text, $x, $y, $w, $h, $font, $color) {
  $brush = New-Object System.Drawing.SolidBrush($color)
  $format = New-Object System.Drawing.StringFormat
  $format.Trimming = [System.Drawing.StringTrimming]::Word
  $rect = New-Object System.Drawing.RectangleF($x, $y, $w, $h)
  $g.DrawString($text, $font, $brush, $rect, $format)
  $brush.Dispose()
  $format.Dispose()
}

$bitmap = New-Object System.Drawing.Bitmap($W, $H)
$g = [System.Drawing.Graphics]::FromImage($bitmap)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
$g.Clear((Color "#f7f8fb"))

$blue = Color "#0052ff"
$ink = Color "#10151f"
$muted = Color "#657184"
$line = Color "#d9e2f2"
$green = Color "#11845b"

FillRound $g 42 40 1116 548 28 (Color "#ffffff") $line 2
FillRound $g 76 74 86 86 20 $blue
DrawText $g "ZG" 96 92 60 52 (Font 34 ([System.Drawing.FontStyle]::Bold)) (Color "#ffffff")
DrawText $g "Zora Genesis" 184 76 520 56 (Font 42 ([System.Drawing.FontStyle]::Bold)) $ink
DrawText $g "AI agent for Base creator asset discovery" 186 130 620 38 (Font 24) $muted

FillRound $g 846 84 220 54 27 (Color "#eaf0ff")
DrawText $g "Base + Zora" 888 98 160 30 (Font 22 ([System.Drawing.FontStyle]::Bold)) $blue

DrawText $g "Turns creator-economy signals into Zora-ready briefs, publishing drafts, and attributed Base builder activity." 78 212 630 150 (Font 46 ([System.Drawing.FontStyle]::Bold)) $ink

FillRound $g 78 438 244 64 18 (Color "#eaf0ff")
DrawText $g "Builder Code" 110 454 180 30 (Font 22 ([System.Drawing.FontStyle]::Bold)) $blue
FillRound $g 340 438 248 64 18 (Color "#eef8f4")
DrawText $g "bc_lk15eqwc" 374 454 180 30 (Font 22 ([System.Drawing.FontStyle]::Bold)) $green

FillRound $g 760 220 316 72 18 (Color "#f7f8fb") $line 2
DrawText $g "Opportunity Radar" 792 238 250 28 (Font 22 ([System.Drawing.FontStyle]::Bold)) $ink
DrawText $g "new assets / launchpads" 792 266 240 24 (Font 18) $muted

FillRound $g 760 318 316 72 18 (Color "#f7f8fb") $line 2
DrawText $g "Monetization" 792 336 250 28 (Font 22 ([System.Drawing.FontStyle]::Bold)) $ink
DrawText $g "premium briefs / services" 792 364 240 24 (Font 18) $muted

FillRound $g 760 416 316 72 18 (Color "#f7f8fb") $line 2
DrawText $g "Publishing Guard" 792 434 250 28 (Font 22 ([System.Drawing.FontStyle]::Bold)) $ink
DrawText $g "approval-first workflow" 792 462 240 24 (Font 18) $muted

$bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bitmap.Dispose()

Get-Item $Path | Select-Object FullName, Length
