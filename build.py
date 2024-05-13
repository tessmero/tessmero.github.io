# build html files based on php files

import os



home_page = 'raincatcher'

all_pages = [
    ['raincatcher',  'Rain Catcher',    True,   '20240128', '20240513','idle'],
    ['loops',        'Loops',     False,   '20240115'],
    ['star',         'Star',      False,   '20240107'],
    ['grass',        'Grass',     True,   '20231203','20231211'],
    ['jellyfish',    'Jellyfish', False,  '20231119'],
    ['ivy',          'Ivy',       False,   '20231112'],
    ['gears',        'Gears',     True,   '20231022'],
    ['mandala',      'Mandala',   False,  '20231015'],
    ['donut',        'Donut',     False,  '20231008'],
    ['bubbles',      'Bubbles',   False,   '20231001','20231029'],
    ['paintball',    'Paintball', False,  '20230924'],
    ['sketch',       'Sketch',    True,   '20230917'],
    ['sand',         'Sand',      True,   '20230910'],
    ['slide',        'Slide',     False,  '20230903'],
    ['cube',         'Cube',      True,   '20230827'],
    ['clouds',       'Clouds',    True,   '20230820'],
    ['spirals',      'Spirals',   False,  '20230813'],
    ['unicycle',     'Unicycle',  False,  '20230806'],
    ['castle',       'Castle',    True,   '20230730'],
    ['planet',       'Planet',    False,  '20230723'],
    ['trees',        'Trees',     True,   '20230716'],
    ['gawlf',        'Gawlf',     True,  '20230709'],
    ['puppy-puddle', 'Puppy',     True,  '20230701'],
    ['warp',         'Warp',      True,   '20230625'],
    ['sugarcubes',   'Sugar',     False,  '20230618'],
    ['tilegame',     'Tile Game', False,  '20230611'],
]
    

# load layout for all pages
with open('layout.php','r') as fin:
    layout = fin.read()
if '<? CONTENT ?>' not in layout:
    raise Exception('invalid layout')
if '<? NAVITEMS ?>' not in layout:
    raise Exception('invalid layout')


# remove existing html files
for fname in os.listdir('.'):
    if fname.endswith('.html') and (not fname.startswith('google')):
        os.remove(fname)
        
        
# get string to populate nav menu for the given page    
def build_navitems(name):
    result = ''
    for row in all_pages:
        if not row[2]: continue
        other_name = row[0]
        label = row[1]
        active = 'active' if other_name==name else ''
        result += f"""
         <li class="nav-item {active}">
           <a class="nav-link" href="{other_name}.html">{label}</a>
         </li>
        """
    active = 'active' if 'demo_list'==name else ''
    result += f"""
     <li class="nav-item {active}">
       <a class="nav-link" href="demo_list.html">More...</a>
     </li>
    """
    return result
    

# write one html file
def write_html( name, outpath ):
    content_path = os.path.join('pages',f'{name}.php')
    
    print(f'{content_path} -> {outpath}')
    
    with open(content_path,'r') as fin:
        content = fin.read()
    navitems = build_navitems(name)
    page_source = layout.replace('<? CONTENT ?>',content).replace('<? NAVITEMS ?>',navitems)
                        
    with open(outpath,'w') as fout:
        fout.write(page_source)
        
        
# write html file for each page
for row in all_pages:
    name = row[0]
    write_html( name, f'{name}.html' )
write_html( home_page, 'index.html' )


# write page with full table of demos
print( "-> demo_list.html" )
content = """
    <br><br><br><br><br>
	<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.13.6/css/jquery.dataTables.min.css">
	<script type="text/javascript" language="javascript" src="https://code.jquery.com/jquery-3.7.0.js"></script>
	<script type="text/javascript" language="javascript" src="https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js"></script>
    <script>
        $( document ).ready(function(){
            $('#demo_list').DataTable({
                order: [[2, 'desc']],
                columnDefs: [
                    {
                        target: 3,
                        orderable: false,
                    },
                    {
                        target: 4,
                        orderable: false,
                    }
                ]
            });
        })
    </script>
    <div class="row">
        <div class="mx-auto col-lg-6 col-md-8 col-sm-12">
            <table id="demo_list" class="display">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Date</th>
                        <th>Last Updated</th>
                        <th>Demo</th>
                        <th>Source</th>
                    </tr>
                </thead>
                <tbody>
"""
for row in all_pages:
    row = list(row)
    if len(row)<5:
        row.append(row[-1])
    reponame = row[0]
    if( len(row) == 6 ): 
        reponame = row[5]
        row = row[:-1]
    row.append(f'<a href="{row[0]}.html">demo</a>')
    row.append(f'<a href="https://github.com/tessmero/{reponame}">source</a>')
    row.pop(2)
    row.pop(0)
    content += "<tr>"
    for cell in row:
        content += f"<td>{cell}</td>"
    content += "</tr>"
content += "</tbody></table></div></div>"
navitems = build_navitems('demo_list')
page_source = layout.replace('<? CONTENT ?>',content).replace('<? NAVITEMS ?>',navitems)
                    
with open('demo_list.html','w') as fout:
    fout.write(page_source)
        
        
        




