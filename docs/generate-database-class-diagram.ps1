Add-Type -AssemblyName System.Drawing

$outputPath = Join-Path $PSScriptRoot "database-class-diagram.png"

$canvasWidth = 2200
$canvasHeight = 1500
$background = [System.Drawing.Color]::FromArgb(250, 250, 248)
$borderColor = [System.Drawing.Color]::FromArgb(50, 62, 72)
$textColor = [System.Drawing.Color]::FromArgb(34, 40, 49)
$mutedTextColor = [System.Drawing.Color]::FromArgb(95, 103, 112)
$lineColor = [System.Drawing.Color]::FromArgb(120, 130, 140)
$headerBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(44, 84, 120))
$boxBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::White)
$titleBrush = [System.Drawing.SolidBrush]::new($textColor)
$fieldBrush = [System.Drawing.SolidBrush]::new($textColor)
$mutedBrush = [System.Drawing.SolidBrush]::new($mutedTextColor)
$linePen = [System.Drawing.Pen]::new($lineColor, 3)
$linePen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$linePen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$boxPen = [System.Drawing.Pen]::new($borderColor, 2)
$dividerPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(220, 225, 230), 1)
$shadowBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(24, 0, 0, 0))

$titleFont = [System.Drawing.Font]::new("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
$fieldFont = [System.Drawing.Font]::new("Consolas", 11)
$smallFont = [System.Drawing.Font]::new("Segoe UI", 10)
$pageTitleFont = [System.Drawing.Font]::new("Segoe UI", 26, [System.Drawing.FontStyle]::Bold)
$pageSubtitleFont = [System.Drawing.Font]::new("Segoe UI", 12)

$bitmap = [System.Drawing.Bitmap]::new($canvasWidth, $canvasHeight)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
$graphics.Clear($background)

function New-Point {
  param([double]$X, [double]$Y)
  return [System.Drawing.PointF]::new($X, $Y)
}

function Draw-Box {
  param(
    [System.Drawing.Graphics]$Graphics,
    [hashtable]$Entity
  )

  $rect = [System.Drawing.Rectangle]::new($Entity.X, $Entity.Y, $Entity.Width, $Entity.Height)
  $headerHeight = 42

  $shadowRect = [System.Drawing.Rectangle]::new($Entity.X + 8, $Entity.Y + 10, $Entity.Width, $Entity.Height)
  $Graphics.FillRectangle($shadowBrush, $shadowRect)
  $Graphics.FillRectangle($boxBrush, $rect)
  $Graphics.DrawRectangle($boxPen, $rect)

  $headerRect = [System.Drawing.Rectangle]::new($Entity.X, $Entity.Y, $Entity.Width, $headerHeight)
  $Graphics.FillRectangle($headerBrush, $headerRect)
  $Graphics.DrawString($Entity.Name, $titleFont, [System.Drawing.Brushes]::White, [System.Drawing.PointF]::new($Entity.X + 14, $Entity.Y + 9))
  $Graphics.DrawLine($dividerPen, $Entity.X, $Entity.Y + $headerHeight, $Entity.X + $Entity.Width, $Entity.Y + $headerHeight)

  $currentY = $Entity.Y + $headerHeight + 10
  foreach ($field in $Entity.Fields) {
    $Graphics.DrawString($field, $fieldFont, $fieldBrush, [System.Drawing.PointF]::new($Entity.X + 14, $currentY))
    $currentY += 24
  }
}

function Get-Anchor {
  param(
    [hashtable]$Entity,
    [string]$Side
  )

  switch ($Side) {
    "Top" { return New-Point ($Entity.X + ($Entity.Width / 2)) $Entity.Y }
    "Bottom" { return New-Point ($Entity.X + ($Entity.Width / 2)) ($Entity.Y + $Entity.Height) }
    "Left" { return New-Point $Entity.X ($Entity.Y + ($Entity.Height / 2)) }
    "Right" { return New-Point ($Entity.X + $Entity.Width) ($Entity.Y + ($Entity.Height / 2)) }
  }
}

function Draw-Endpoint {
  param([System.Drawing.Graphics]$Graphics, [System.Drawing.PointF]$Point)
  $Graphics.FillEllipse([System.Drawing.Brushes]::White, $Point.X - 5, $Point.Y - 5, 10, 10)
  $Graphics.DrawEllipse($boxPen, $Point.X - 5, $Point.Y - 5, 10, 10)
}

function Draw-Relation {
  param(
    [System.Drawing.Graphics]$Graphics,
    [hashtable]$From,
    [string]$FromSide,
    [hashtable]$To,
    [string]$ToSide,
    [string]$FromLabel,
    [string]$ToLabel,
    [object[]]$Waypoints = @()
  )

  $start = Get-Anchor -Entity $From -Side $FromSide
  $end = Get-Anchor -Entity $To -Side $ToSide
  $points = @($start)
  if ($Waypoints) {
    $points += $Waypoints
  }
  $points += $end

  for ($i = 0; $i -lt ($points.Count - 1); $i++) {
    $Graphics.DrawLine($linePen, $points[$i], $points[$i + 1])
  }

  Draw-Endpoint -Graphics $Graphics -Point $start
  Draw-Endpoint -Graphics $Graphics -Point $end

  if ($FromLabel) {
    $Graphics.DrawString($FromLabel, $smallFont, $mutedBrush, (New-Point ($start.X + 8) ($start.Y - 22)))
  }

  if ($ToLabel) {
    $Graphics.DrawString($ToLabel, $smallFont, $mutedBrush, (New-Point ($end.X + 8) ($end.Y - 22)))
  }
}

$entities = @(
  @{ Name = "User"; X = 90; Y = 160; Width = 360; Height = 210; Fields = @("id: String <<PK>>","name: String","email: String <<UNIQUE>>","passwordHash: String","createdAt: DateTime") },
  @{ Name = "Session"; X = 610; Y = 110; Width = 360; Height = 210; Fields = @("id: String <<PK>>","name: String","passwordHash: String?","createdAt: DateTime","createdById: String <<FK>>") },
  @{ Name = "Template"; X = 1230; Y = 110; Width = 360; Height = 210; Fields = @("id: String <<PK>>","name: String","data: Json","createdAt: DateTime","createdById: String <<FK>>") },
  @{ Name = "Character"; X = 930; Y = 520; Width = 390; Height = 234; Fields = @("id: String <<PK>>","name: String","data: Json","createdAt: DateTime","userId: String <<FK>>","sessionId: String <<FK>>","templateId: String <<FK>>") },
  @{ Name = "Message"; X = 1500; Y = 520; Width = 380; Height = 234; Fields = @("id: String <<PK>>","content: String","type: MessageType","diceData: Json?","createdAt: DateTime","userId: String <<FK>>","sessionId: String <<FK>>") },
  @{ Name = "SessionParticipant"; X = 380; Y = 560; Width = 420; Height = 210; Fields = @("id: String <<PK>>","joinedAt: DateTime","userId: String <<FK>>","sessionId: String <<FK>>","unique(userId, sessionId)") }
)

$entityMap = @{}
foreach ($entity in $entities) {
  $entityMap[$entity.Name] = $entity
}

$graphics.DrawString("Database Class Diagram", $pageTitleFont, $titleBrush, (New-Point 80 36))
$graphics.DrawString("Generated from prisma/schema.prisma - includes Template relation updates", $pageSubtitleFont, $mutedBrush, (New-Point 84 84))

foreach ($entity in $entities) {
  Draw-Box -Graphics $graphics -Entity $entity
}

Draw-Relation -Graphics $graphics -From $entityMap.User -FromSide Right -To $entityMap.Session -ToSide Left -FromLabel "1" -ToLabel "0..*"
Draw-Relation -Graphics $graphics -From $entityMap.User -FromSide Top -To $entityMap.Template -ToSide Top -FromLabel "1" -ToLabel "0..*" -Waypoints @(
  (New-Point 270 96),
  (New-Point 1410 96)
)
Draw-Relation -Graphics $graphics -From $entityMap.User -FromSide Bottom -To $entityMap.Character -ToSide Left -FromLabel "1" -ToLabel "0..*" -Waypoints @(
  (New-Point 270 480),
  (New-Point 900 480),
  (New-Point 900 637)
)
Draw-Relation -Graphics $graphics -From $entityMap.Session -FromSide Bottom -To $entityMap.Character -ToSide Top -FromLabel "1" -ToLabel "0..*" -Waypoints @(
  (New-Point 790 430),
  (New-Point 1125 430)
)
Draw-Relation -Graphics $graphics -From $entityMap.Template -FromSide Bottom -To $entityMap.Character -ToSide Top -FromLabel "1" -ToLabel "0..*" -Waypoints @(
  (New-Point 1410 430),
  (New-Point 1125 430)
)
Draw-Relation -Graphics $graphics -From $entityMap.User -FromSide Bottom -To $entityMap.Message -ToSide Left -FromLabel "1" -ToLabel "0..*" -Waypoints @(
  (New-Point 270 860),
  (New-Point 1450 860),
  (New-Point 1450 637)
)
Draw-Relation -Graphics $graphics -From $entityMap.Session -FromSide Bottom -To $entityMap.Message -ToSide Top -FromLabel "1" -ToLabel "0..*" -Waypoints @(
  (New-Point 790 430),
  (New-Point 1690 430)
)
Draw-Relation -Graphics $graphics -From $entityMap.User -FromSide Bottom -To $entityMap.SessionParticipant -ToSide Left -FromLabel "1" -ToLabel "0..*" -Waypoints @(
  (New-Point 270 665)
)
Draw-Relation -Graphics $graphics -From $entityMap.Session -FromSide Bottom -To $entityMap.SessionParticipant -ToSide Top -FromLabel "1" -ToLabel "0..*" -Waypoints @(
  (New-Point 790 450),
  (New-Point 590 450)
)

$legendX = 80
$legendY = 1290
$graphics.DrawString("Legend", $titleFont, $titleBrush, (New-Point $legendX $legendY))
$graphics.DrawString("PK = primary key   FK = foreign key   UNIQUE = unique constraint", $smallFont, $mutedBrush, (New-Point $legendX ($legendY + 34)))
$graphics.DrawString("Relations use routed connectors to keep lines out of entity boxes.", $smallFont, $mutedBrush, (New-Point $legendX ($legendY + 58)))

$bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)

$graphics.Dispose()
$bitmap.Dispose()
$titleFont.Dispose()
$fieldFont.Dispose()
$smallFont.Dispose()
$pageTitleFont.Dispose()
$pageSubtitleFont.Dispose()
$headerBrush.Dispose()
$boxBrush.Dispose()
$titleBrush.Dispose()
$fieldBrush.Dispose()
$mutedBrush.Dispose()
$linePen.Dispose()
$boxPen.Dispose()
$dividerPen.Dispose()
$shadowBrush.Dispose()

