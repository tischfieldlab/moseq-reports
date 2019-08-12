import os

templates = os.path.join('templates')

def main():
    index_template = os.path.join(templates, 'views', 'index-template.html')
    navigation_template = os.path.join(templates, 'views', 'navigation-bar.html')
    with open('index.html', 'w') as index_file:
        with open(index_template, 'r') as f:
           index_conts = f.read()
        with open(navigation_template, 'r') as f:
            nav_conts = f.read()
        index_conts = index_conts.replace('$navBar', nav_conts)
        index_file.write(index_conts)
#end main()

if __name__ == '__main__':
    main()