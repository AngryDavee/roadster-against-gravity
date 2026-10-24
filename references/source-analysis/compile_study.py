"""Compile reference observations into local research artifacts; no scene generation."""
import csv
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
FPS_NUM, FPS_DEN = 24000, 1001

def sec(frame):
    return round(frame * FPS_DEN / FPS_NUM, 9)

shots = [
    dict(id='S01', first_frame=0, end_frame_exclusive=51, title='Rear close view at ramp foot',
         camera='Low rear three-quarter view; car approximately central, full ramp height cropped. Very slight framing movement.',
         action='Establish the car before the ascent. No airborne effects. Rear light stays red.',
         details=['Silver body and black glass reflect the red ramp edges.', 'Four rear-facing circular outlets, RDSTR plate, deep black rear mechanical cavity and broad tires are visible.', 'Ramp center stripe continues onto the foreground pavement. Panel joins, low blocks and a small bracket/camera at the right edge matter.'],
         transition='Hard cut at frame 51 to a distant view; no dissolve.'),
    dict(id='S02', first_frame=51, end_frame_exclusive=419, title='Wide ascent, flip, landing and drive-away',
         camera='Distant ground view initially shows the entire ramp. Camera progressively reframes/pans with the car, follows the descent left, then tracks the drive-away. This is one continuous edited shot.',
         action='Wait at foot; climb the curved wall; reach the overhanging lip; rotate away; stabilize on downward jets; descend through a spreading cloud; emerge and drive away.',
         details=['A second stationary light-colored vehicle is visible at far right initially.', 'Ramp lower edge changes toward cool white while upper edge remains red; background red strip and floodlights progressively appear.', 'The ramp moves toward/right out of frame during the landing follow.', 'Vapor briefly obscures the tires and touchdown; do not assign an exact physical contact frame from an occluded image.', 'Brightness changes near 13.889 seconds are cloud/lighting motion, not an extra cut.'],
         transition='Hard cut at frame 419 resets the action to departure from the ramp lip.'),
    dict(id='S03', first_frame=419, end_frame_exclusive=656, title='Closer slowed replay of rotation and landing',
         camera='Tighter low view of the upper ramp; camera tilts down and follows the descending car, ending with a frontal/three-quarter emergence from vapor.',
         action='Replay starts with the car at the lip and lateral gas visible. Side/underside rotate into view. Jets become predominantly downward; car hangs above the cloud then lowers and emerges.',
         details=['Front white light bar blooms at both corners.', 'Large underside panels and channels are visible; this cannot be an unmodeled flat bottom.', 'A moving car shadow falls onto the ramp face.', 'A lateral jet and multiple downward jets do not all begin together.', 'Vapor is lit cyan-white from lamps/headlights and pink-red from floor lighting.', 'Changes near 20.270 and 26.443 seconds are movement/illumination, not cuts.'],
         transition='Hard cut at frame 656 jumps back to an airborne position from an elevated close camera.'),
    dict(id='S04', first_frame=656, end_frame_exclusive=743, title='Elevated close aerial replay',
         camera='High oblique moving/rolling view beside the ramp lip; pronounced diagonal composition and floodlight flare. Tracks the car downward.',
         action='Car rotates away from the lip, exposes its undertray, becomes upright with black roof visible, then descends over crossed white ground lines into growing vapor.',
         details=['Ramp lip/truss enters from the right edge initially.', 'Two bright crossing ground lines form a fixed registration landmark.', 'Floodlights produce large white glare and pale green/purple lens artifacts.', 'Underbody has rectangular panels, channels and dark structural boundaries.', 'Nearby equipment/vehicles are small contextual elements; do not replace them with the earlier five-car stunt lineup.'],
         transition='Hard cut at frame 743 resets to the foot of the ramp in a distant aerial view.'),
    dict(id='S05', first_frame=743, end_frame_exclusive=1094, title='Distant aerial replay of the complete maneuver',
         camera='High wide oblique view; nearly fixed with slow drift. Full ramp in upper right, parked car lower right, crossing ground lines through the landing area.',
         action='Another ascent, departure/rotation, jet-assisted descent, landing and drive-away toward lower left. Cloud trails behind and dissipates.',
         details=['Red-lit barrier/viewing area behind the action becomes prominent as lights sweep on.', 'Floodlight pools illuminate the ground; maintain the large black negative space.', 'Hero car and parked car are separate objects; the parked car does not perform the maneuver.', 'Ground shadow tracks the airborne car before vapor masks it.', 'Video ends on the wide venue with residual vapor; no closing title or fade-to-black is present.'],
         transition='Final source video frame 1093 at 45.587208 seconds. Its display interval ends at 45.628917 seconds; audio/container continues to 45.674667 seconds.'),
]
for s in shots:
    s['start_seconds'] = sec(s['first_frame'])
    s['end_seconds_exclusive'] = sec(s['end_frame_exclusive'])
    s['duration_seconds'] = sec(s['end_frame_exclusive']-s['first_frame'])

# These are observed anchor windows, not a recovered physical simulation.
event_rows = [
('S01',0,50,'Opening car/ramp composition; red rear light and edge lights','high'),
('S02',51,84,'Wide reveal and pause at ramp foot','high'),
('S02',84,102,'Ascent becomes clearly apparent','medium; gradual onset'),
('S02',120,180,'Car climbs steep face; headlight pool moves up the deck','high'),
('S02',156,192,'Lower ramp edges and background lighting become more visible','medium; gradual illumination'),
('S02',216,230,'Car approaches curled upper lip; roof remains visible','high'),
('S02',230,238,'Lateral blue-white gas appears near departure; car begins rotating away','medium; overlap and distance'),
('S02',238,254,'Aerial rotation and leftward separation from ramp','high'),
('S02',254,266,'Car becomes broadly level; downward jets lengthen','high'),
('S02',266,276,'Jets reach pavement and build an expanding white cloud','high'),
('S02',276,300,'Car suspended above dense rolling vapor, continuing down/left','high'),
('S02',300,318,'Final lowering/contact interval; wheels obscured by cloud','medium; contact not directly visible'),
('S02',324,342,'Car emerges at ground level through remaining vapor','high'),
('S02',342,418,'Drive-away with trailing vapor; camera tracks','high'),
('S03',419,432,'Replay departure at lip with lateral jet activity','high'),
('S03',432,474,'Slowed rotation exposes side then underside','high'),
('S03',474,510,'Front faces camera; lateral and downward jets visible','high'),
('S03',510,528,'Downward jets strengthen; moving shadow on ramp','high'),
('S03',528,552,'Ground vapor blooms outward beneath descending car','high'),
('S03',552,582,'Car nearly level above large cloud','high'),
('S03',582,606,'Final lowering into opaque vapor; exact wheel contact hidden','medium'),
('S03',606,636,'Cloud occlusion; headlights become diffuse bright spots','high'),
('S03',636,655,'Front emerges at ground level','high'),
('S04',656,666,'Close aerial departure; ramp lip right; car turning','high'),
('S04',666,678,'Undertray exposed; several narrow directional gas streams','high'),
('S04',678,696,'Roof turns into view as the car levels','high'),
('S04',696,714,'Descent over crossed lines; jets beneath car','high'),
('S04',714,742,'Cloud expands under the car; shot ends before a clear wheel-contact view','high'),
('S05',743,780,'Full venue reset; car at ramp foot, second car parked lower right','high'),
('S05',780,834,'Ascent through ramp curve','high'),
('S05',834,906,'Upper-ramp approach; background strip and floodlights brighten','high'),
('S05',906,924,'Departure and rotation high left of ramp lip','medium; small subject'),
('S05',924,942,'Car levels and descends; downward jets visible','high'),
('S05',942,960,'Cloud first expands across landing area','high'),
('S05',960,984,'Lowering/landing zone; cloud hides exact tire contact','medium'),
('S05',984,1044,'Drive-away toward lower left, leaving long cloud trail','high'),
('S05',1044,1093,'Hero exits; vapor thins; parked car and illuminated venue remain','high'),
]
events = [dict(shot=s, first_frame=a, last_frame=b, start_seconds=sec(a), end_seconds=sec(b), observation=o, confidence=c) for s,a,b,o,c in event_rows]

asset_rows = [
('hero_car_body','Silver/white wedge coupe; sharp diagonal fender/hood boundaries; dark lower sill; short pointed nose; broad rear shoulders','user video F0, F492; user images.jpeg; Tesla Track Mode side views','High for visible silhouette; absolute dimensions unverified'),
('glass_and_cabin','Continuous dark windshield/roof canopy; tapered side glass, silver pillars and black glazing borders. No identifiable driver in stunt footage','user F0,F690; user front image; official side views','High for exterior; cabin obscured'),
('front_lighting_and_intake','Thin near-full-width white light bar; strong corner bloom; broad dark lower aperture and splitter','user F492,F642; images.jpeg','High'),
('rear_lighting_and_plate','Continuous red bar in black recess; centered pale RDSTR plate with plate illumination','user F0; Roadster_94.webp','High'),
('wheels_and_tires','Four broad dark tires, sculptural five-arm/star-style rims, inset hubs and dark arches; front wheel steering and wheel spin must be separate from body transform','user image; official Track Mode and launch-film wheel view','High shape; exact tire/rim dimensions unverified'),
('rear_thruster_bank','Four circular rear-facing nozzles in one horizontal row under plate; concentric lips and deep dark bores','user F0; Roadster_94.webp; official launch-film nozzle closeups','High'),
('belly_and_side_thrusters','Distinct lateral attitude jets and downward lifting/braking jets. Nozzle positions require matching visible streams; not all visible rear ports fire downward','user F240,F492,F522,F672; studio rear','High effect direction; full hidden nozzle layout inferred'),
('undertray','Dark rectangular panel grid, longitudinal channels, recesses/structural ribs and wheel cutouts; visible during rotation','user F492,F672; official launch-film underside reference','High broad layout; tiny fittings unresolved'),
('rear_wing_and_aero','Broad articulated rear wing with end plates/supports; studio still shows raised state, opening stunt much lower. Official Track Mode video shows multiple configurations','Roadster_94.webp; user F0; Tesla Track Mode','High; do not impose studio deployment on every stunt shot'),
('ramp_deck','Tall continuous curved ramp with shallow foot transition, near-vertical midsection and overhanging curled lip; pale gray surface, center white stripe, rectangular panel seams and small mottling','all supplied shots; especially F0,F240,F743','High silhouette; metric dimensions and exact profile inferred'),
('ramp_structure','Rear/right triangular lattice supports, verticals, diagonal braces, horizontal crossmembers, feet and upper lip framework','user wide shots and F656','High visible framing; hidden bracing inferred'),
('ramp_edge_lighting','Two thin edge strips, initially red; cool-white lower illumination during ascent, red still visible near top. Preserve luminous core and soft spill','user F0,F240,F492','High; exact control circuit irrelevant'),
('ground_and_markings','Very dark gray paved ground, faint seams, subdued rough reflections; white approach centerline and two crossing long lines in aerial view','user F0,F672,F743','High; visible markings need registration'),
('venue_light_rigs','Banks of intense white lamps on stands/poles; cone-like light pools; sparse distant lamps; timed brightening and camera flare','user wide shots and aerials','High for screen positions; exact fixture models inferred'),
('red_boundary_and_background','Long red luminous horizontal barrier strip; repeated small fixtures and red-lit background canopy/viewing structures revealed by later lighting','user S02,S04,S05','High general arrangement; dark background details uncertain'),
('secondary_vehicles_and_equipment','Stationary light-colored car far right in first wide view/lower right aerial; small equipment vehicles/boxes by lights and ramp','user S02,S04,S05','High presence; do not assert specific model without detail'),
('small_ramp_fixtures','Low rectangular blocks at ramp base, narrow brackets/camera hardware at right edge and subtle cables/support fittings','user F0','Medium; only recreate what is visible'),
('gas_and_cloud_effects','Thin blue-white directional jets expand into turbulent pale clouds on reaching ground; larger uneven lobes roll outward, retain momentum, obscure car, dissipate, pick up cyan/red lighting','all airborne and landing shots','High; exact turbulence is not recoverable from video'),
]
assets = [dict(id=a,appearance=b,evidence=c,confidence=d) for a,b,c,d in asset_rows]

sources = [
dict(id='user-video',url='app/reference/master.mp4',role='Authoritative edit, timing, camera, action and stunt configuration'),
dict(id='user-front',url='references/user/car-front.jpeg',role='Supporting front silhouette; low resolution and cropped, not an orthographic blueprint'),
dict(id='user-rear',url='references/user/car-rear.webp',role='Supporting rear/nozzle/raised-wing detail; configuration differs from opening stunt'),
dict(id='tesla-ramp',url='https://x.com/Tesla/status/2110913438293647789',role='Official ramp clip located through public X syndication metadata; duration 45628 ms, published 2026-10-16. Same ramp sequence as supplied file; not a byte-for-byte hash comparison'),
dict(id='tesla-track-mode',url='https://x.com/Tesla/status/2110905133785829671',role='Official aero configuration film. Inspected sampled frames for side silhouette, front fender aero and rear-wing states'),
dict(id='tesla-launch-film',url='https://x.com/Tesla/status/2110906094155399277',role='Official launch film. Inspected sampled frames for underbody, nozzle lips, body seams, wheel design and light-bar construction'),
dict(id='tesla-product',url='https://www.tesla.com/roadster?redirect=no',role='Official product page; accessible extracted text limited to trim disclaimers. No dimensions/performance claims taken from it'),
dict(id='reference-index',url='https://superchargeddaily.com/roadster.html',role='Discovery index only, used to find primary Tesla posts; no engineering specifications taken from it'),
dict(id='reference-gallery',url='https://www.autoexpress.co.uk/tesla/roadster/370689/new-tesla-roadster-revealed-2026-pictures',role='Supplementary gallery discovered; official films preferred for actual observations'),
dict(id='previous-clip',url='https://x.com/elonmusk/status/2110913107094606330',role='Earlier 15.395-second lineup stunt; NOT the master for this 45.629-second ramp study'),
dict(id='404-recipe',url='https://github.com/404-Repo/404-game-recipe',role='Local pinned recipe reviewed: README.md, 404.md, docs/asset-contract.md and docs/surfaces.md. Commit 4effad311c5e137bca316257259fe5bffd6737de'),
]

study = dict(
    title='Roadster ramp stunt: reference study before production',
    analysis_date='2026-10-23',
    status='Reference analysis complete at shot/event level. Production and style selection not started.',
    scope='Recreate the supplied ramp film using 404 asset modules and Atlas MCP for generated visual references/assets within the recipe contract. Await user texture/animation inspiration before production.',
    media=dict(width=3840,height=2160,aspect_ratio='16:9',fps_numerator=24000,fps_denominator=1001,decoded_video_frames=1094,
               first_frame_pts=0,last_frame_pts_seconds=sec(1093),video_duration_seconds=sec(1094),container_duration_seconds=45.674666667,
               audio='AAC LC, stereo, 48000 Hz; container/audio extends about 45.75 ms beyond video.',
               timing_basis='Zero-based source frame index; t = frame * 1001 / 24000. Frame filenames in all-frames are one-based; keyframe filenames are zero-based.',
               analysis_coverage='Decoded/indexed all 1094 frames. Visually reviewed all five shots on quarter-second contact sheets, denser launch samples and adjacent candidate-cut frames; 21 larger keyframes; both local stills and four supplied inline screenshots; sampled two supplementary official Tesla films.',
               audio_review_limit='Audio stream metadata verified. No listening/transcription or sound-design cue audit completed; do not describe soundtrack details as observed.'),
    shots=shots, events=events, assets=assets, sources=sources,
    visual_priorities=[
        'Match silhouette, frame composition, black negative space, ramp contour and car scale before micro-detail.',
        'Keep five shots/four hard cuts at the measured source frames, including the three action resets for alternate views.',
        'Match actual screen-space trajectory and orientation at anchors; avoid assuming the maneuver is a single pure-axis backflip or uniform angular spin.',
        'Camera motion and exposure are part of the reference: do not replace each shot with a static generic orbit.',
        'Preserve separate lateral and downward jet timing. Gas is pale/cyan under lighting; no orange rocket fire is visible in this stunt.',
        'Clouds must occlude geometry, spread along the ground, continue after jet shutoff and receive venue lighting.',
        'Include ramp and ground shadows, white light pools, red spill on car/glass, and strong aerial-shot flare.',
        'Do not add water, mountains, a city skyline, unnecessary stars, crowds in foreground or the earlier five-car lineup.',
        'Do not bake a raised studio wing or decorative details into every shot where the source does not show them.',
    ],
    synchronization_plan=[
        'Use the supplied MP4 as the sole edit master. Online films and stills supplement shape only.',
        'Evaluate scene state from absolute source time, not accumulated render-frame dt. Export at 24000/1001 fps; use the indexed presentation timestamps.',
        'Define a separate action-time mapping for each replay shot. Do not run the stunt four times sequentially in one shared simulation or assume one global slow-motion multiplier.',
        'Solve camera pose/FOV and car transforms together against ramp lip/base, center stripe, crossing ground lines, car silhouette and fixed lights. Physical dimensions remain estimates until externally verified.',
        'Keyframe body translation and quaternion rotation; keep wheel spin, suspension, wing configuration and nozzle emitters as separate named parts.',
        'Make procedural effects deterministic with seeded randomness and time-addressable simulation so scrubbing/rendering the same frame reproduces the same cloud.',
        'At each cut validate last old-shot frame and first new-shot frame. Then compare event anchors using side-by-side and blended overlays.',
        'Review the source tail deliberately: 1094 video frames last 45.628917 seconds, while audio/container last 45.674667 seconds. If preserving source audio duration, hold the final image for the remaining interval.',
        'Treat frame-accurate cut alignment as a measurable target, not proof of pixel-identical recreation. Gradual/occluded events use observation windows.',
    ],
    recipe_and_atlas_plan=[
        'No Unity, Unreal, Blender or downloaded mesh replacement. The 404 approach is editable JavaScript geometry returning Three.js Groups, rendered with Three.js.',
        'Read user style inspiration first, then fix one shared style statement for all Atlas-generated references.',
        'For each important 3D asset produce three genuinely independent candidates, render verification views, inspect proportions and choose by evidence. Do not claim this loop has been executed during reference analysis.',
        'Asset modules remain import/network/file/texture-free under the pinned contract, use explicit materials, real-scale placement, base y=0 and front +Z.',
        'The pinned recipe surface system generates seeded color/roughness/normal maps at load time; it does not establish permission to load arbitrary image maps. Use Atlas surface imagery as references for that procedural material treatment. Do not silently label external texture imports as strict recipe compliance.',
        'Preserve animated car hierarchy with the recipe loader keepHierarchy option; merging the complete vehicle would destroy movable wheels/wing/emitters.',
        'Run recipe selftests and asset verification during production; adapt motion/frame comparisons for this cinematic. A game-jam gate is not automatically evidence that a cinematic matches its reference.',
        'Keep reference provenance, Atlas project/job/output IDs, candidate choices and verification artifacts. Reference images/video are study inputs, not assets to masquerade as generated 3D.',
        'Current session exposes no Atlas MCP tools and ATLAS_API_KEY was absent when checked. Connection must be restored and verified before any Atlas generation. No Atlas generation was performed in this analysis.',
    ],
    uncertainties=[
        'Exact vehicle/ramp dimensions, camera lenses, physical coordinates and hidden structure cannot be uniquely recovered from the supplied views.',
        'A detailed 3D camera/trajectory solve has not been performed; recorded camera descriptions and timing anchors are observations for that later work.',
        'The isolated rear image uses a deployed-wing configuration; the video controls wing state for the reconstruction.',
        'Exact wheel-contact instants are concealed by vapor. Windows are recorded instead of invented single-frame certainty.',
        'Original turbulent gas motion cannot be reproduced pixel-for-pixel from a single video; match onset, direction, volume, footprint, lighting and occlusion.',
        'Audio listening/cue annotation remains outstanding if soundtrack recreation is part of the final deliverable.',
        'Final visual style, surface treatment and delivery format await the promised user inspiration.',
    ],
    preserved_work='Existing tidebreak project and canonical 404 recipe were not modified; no push or deployment performed.',
)

manifest=[]
for name in ['app/reference/master.mp4','references/user/car-front.jpeg','references/user/car-rear.webp']:
    p=ROOT.parents[1]/name
    manifest.append(dict(path=name,bytes=p.stat().st_size,sha256=hashlib.sha256(p.read_bytes()).hexdigest(),use='Reference only'))
study['source_file_manifest']=manifest
(ROOT/'study.json').write_text(json.dumps(study,indent=2)+'\n')
for name,rows in [('shot-timeline.csv',shots),('event-anchors.csv',events),('asset-inventory.csv',assets)]:
    with (ROOT/name).open('w',newline='') as f:
        writer=csv.DictWriter(f,fieldnames=list(rows[0]));writer.writeheader()
        writer.writerows({k:json.dumps(v) if isinstance(v,list) else v for k,v in row.items()} for row in rows)
print('Wrote structured study, source hashes, five-shot timeline, 37 event windows and 18-part asset inventory.')

if __name__=='__main__':
    # A human-readable research report, not an animation or a website.
    from reportlab.lib import colors
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.enums import TA_LEFT
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak, KeepTogether
    from reportlab.lib.pagesizes import A4
    from xml.sax.saxutils import escape
    styles=getSampleStyleSheet()
    styles.add(ParagraphStyle(name='Note',parent=styles['BodyText'],fontSize=9,leading=13,spaceAfter=7))
    styles.add(ParagraphStyle(name='Subtitle',parent=styles['BodyText'],fontSize=11,leading=15,spaceAfter=14,textColor=colors.HexColor('#52616a')))
    styles['Heading1'].textColor=colors.HexColor('#133e50')
    styles['Heading2'].textColor=colors.HexColor('#133e50')
    story=[]
    def para(t,style='Note'): return Paragraph(escape(t),styles[style])
    def add(t,style='Note'):story.append(para(t,style))
    def bullet(t):add('• '+t)
    def picture(path,width=480):
        from PIL import Image as PILImage
        with PILImage.open(path) as im:w,h=im.size
        story.append(Image(str(path),width=width,height=width*h/w));story.append(Spacer(1,8))
    add('ROADSTER / RAMP STUNT','Title')
    add('Reference analysis • 23 October 2026 • Production not started','Subtitle')
    picture(ROOT/'keyframes/frame-0000.jpg')
    add('What is established','Heading1')
    add('The supplied film contains 1,094 video frames at 23.976 fps (3840 × 2160). Its picture lasts 45.628917 seconds; the container/audio lasts 45.674667 seconds. There are five camera shots and four hard cuts. The maneuver is replayed from closer and elevated viewpoints; these are editorial resets, not four consecutive stunts.')
    add('This study covers the ramp film. The previously linked 15.395-second clip above parked Teslas is a different edit and must not be mixed into its timeline.')
    add('Scope and honesty','Heading2')
    add(study['media']['analysis_coverage'])
    add('Exact cuts are frame-indexed. Gradual motion/effects and occluded landings are recorded as windows. Camera calibration, final geometry, effects and pixel comparisons are future production work; this report does not claim that every unseen detail is recoverable.')
    add('Atlas is required for the production workflow, but is not connected in this session. No generation, animation build, deployment or game changes were made.')
    story.append(PageBreak())
    add('The edit master','Heading1')
    rows=[[para('Shot'),para('Source time'),para('Content')]]
    for s in shots:rows.append([para(s['id']),para(f"{s['start_seconds']:.3f}–{s['end_seconds_exclusive']:.3f}s"),para(s['title'])])
    table=Table(rows,colWidths=[45,115,320],repeatRows=1)
    table.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#e1ebef')),('VALIGN',(0,0),(-1,-1),'TOP'),('GRID',(0,0),(-1,-1),.4,colors.HexColor('#bbbbbb')),('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),6)]));story.append(table)
    story.append(Spacer(1,12))
    add('Cut frames (zero-based): 51, 419, 656, 743. Their timestamps are 2.127125, 17.475792, 27.360667 and 30.989292 seconds. All are hard cuts. No final title/fade is present.')
    add('The automated detector also reacted to vapor and moving lights. Candidate changes around 13.889, 20.270 and 26.443 seconds were visually rejected as cuts.')
    add('Timing equation: source time = frame × 1001 / 24000. Do not round the master to 24 fps or use 45.67 seconds as the picture duration.')
    for i,s in enumerate(shots):
        story.append(PageBreak());add(s['id']+' — '+s['title'],'Heading1')
        add(f"Frames {s['first_frame']}–{s['end_frame_exclusive']-1} | {s['start_seconds']:.6f}–{s['end_seconds_exclusive']:.6f}s")
        n=[0,240,492,672,743][i];picture(ROOT/'keyframes'/f'frame-{n:04d}.jpg')
        add('Camera: '+s['camera']);add('Action: '+s['action'])
        for d in s['details']:bullet(d)
        add('Transition: '+s['transition'])
        add('Observed anchors','Heading2')
        for e in events:
            if e['shot']==s['id']:add(f"{e['start_seconds']:.3f}–{e['end_seconds']:.3f}s: {e['observation']}. Confidence: {e['confidence']}.")
    story.append(PageBreak());add('Vehicle and venue inventory','Heading1')
    for a in assets:
        story.append(KeepTogether([para(a['id'].replace('_',' ').title(),'Heading2'),para(a['appearance']),para('Evidence: '+a['evidence']+'. '+a['confidence']+'.')]))
    story.append(PageBreak());add('What the supplementary research resolved','Heading1')
    add('Tesla’s official Track Mode film shows the car in side profile and multiple rear-wing/aero states. It helps distinguish the low stunt configuration from the raised wing in the supplied rear still. The official launch film supplies close views of nozzle lips, wheel construction, body seams and underbody structure. These films are shape references; they do not replace the user video’s timing.')
    picture(ROOT/'contact-sheets/primary-2110905133785829671-1.jpg',width=440)
    add('The visible jets in the stunt are pale blue-white gas/vapor, becoming white clouds near the ground. Do not replace them with orange flames. Rear-facing ports and downward/side jets must remain distinct.')
    story.append(PageBreak());add('Reconstruction priorities','Heading1')
    for t in study['visual_priorities']:bullet(t)
    add('Synchronizing a future build','Heading1')
    for t in study['synchronization_plan']:bullet(t)
    story.append(PageBreak());add('404 + Atlas production constraints','Heading1')
    for t in study['recipe_and_atlas_plan']:bullet(t)
    add('What remains uncertain / pending','Heading1')
    for t in study['uncertainties']:bullet(t)
    story.append(PageBreak());add('Sources and saved evidence','Heading1')
    for s in sources:
        add(s['id'],'Heading2');add(s['role']);add(s['url'])
    add('Saved alongside this report','Heading2')
    add('study.json; shot-timeline.csv; event-anchors.csv; asset-inventory.csv; frame-index.json; all-frames/; keyframes/; contact-sheets/; raw public Tesla post metadata; supplementary official reference clips. These are local study inputs, not shipping assets. The original user files remain in Downloads.')
    def footer(canvas,doc):
        canvas.setFillColor(colors.white);canvas.rect(0,0,A4[0],A4[1],stroke=0,fill=1)
        canvas.setFont('Helvetica',8);canvas.setFillColor(colors.HexColor('#666666'));canvas.drawString(42,24,'404 + Atlas • Reference analysis only');canvas.drawRightString(A4[0]-42,24,str(doc.page))
    SimpleDocTemplate(str(ROOT/'Roadster-reference-study.pdf'),pagesize=A4,rightMargin=42,leftMargin=42,topMargin=38,bottomMargin=40,title=study['title'],author='Reference study').build(story,onFirstPage=footer,onLaterPages=footer)
    print('Wrote Roadster-reference-study.pdf')
