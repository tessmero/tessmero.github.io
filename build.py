# build html files based on php files

import os


all_pages = [
    ['paintball','Paintball'],
    ['sketch','Sketch'],
    ['sand','Sand'],
    ['slide', 'Slide'],
    ['cube', 'Cube'],
    ['clouds','Clouds'],
    ['spirals','Spirals'],
    ['unicycle','Unicycle'],
    ['castle','Castle'],
    ['planet', 'Planet'],
    ['trees', 'Trees'],
    ['gawlf', 'Gawlf'],
    ['puppy-puddle', 'Puppy Puddle'],
    ['warp', 'Warp'],
    ['sugarcubes', 'Sugar Cubes'],
    ['tilegame', 'Tile Game'],
]

home_page = 'paintball'
    

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
    for other_name,label in all_pages:
        active = 'active' if other_name==name else ''
        result += f"""
         <li class="nav-item {active}">
           <a class="nav-link" href="{other_name}.html">{label}</a>
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
for name,label in all_pages:
     write_html( name, f'{name}.html' )
write_html( home_page, 'index.html' )
        
        




