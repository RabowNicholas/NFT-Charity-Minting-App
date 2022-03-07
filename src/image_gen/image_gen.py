import colorsys
import cv2
import numpy as np
import os.path
from PIL import Image, ImageSequence, ImageDraw, ImageFilter, ImageFont



#generate 500 images with random backgrounds and line colors
#5 different backgrounds
#    water
#    mountains
#    fire
#    clouds
#    space
#random line colors

IMAGE_SIZE_PX = 512
NUM_LINES = 15
LINE_THICKNESS = 4
PADDING = 0.05 * IMAGE_SIZE_PX
BLACK = (0,0,0)
script_dir = os.path.dirname(os.path.abspath(__file__))
FONT = ImageFont.truetype(os.path.join(script_dir, 'cybersystem2-3.ttf'), 100)

def random_color():
    h = np.random.random()
    s = 1
    v = 1
    rgb = colorsys.hsv_to_rgb(h,s,v)
    return(
        int(rgb[0] * 255),
        int(rgb[1] * 255),
        int(rgb[2] * 255),
        255
    )

def line_image(_image_size_px=IMAGE_SIZE_PX,
               _num_lines=NUM_LINES,
               _line_thickness=LINE_THICKNESS,
               _padding=PADDING,
               _color=BLACK,
               _font=FONT,
               _tokenID='0'
               ):
    # image = np.full((_image_size_px,_image_size_px,4),0, dtype=np.uint8)
    # image = Image.fromarray(image)
    image = Image.new('RGBA',size=(_image_size_px,_image_size_px))
    draw = ImageDraw.Draw(image)

    #generate points for image
    points=[]
    point = (
        random_point(_image_size_px, _padding),
        random_point(_image_size_px, _padding),
    )
    points.append(point)    # points.append(np.random.randint(low=_padding, high=-_padding, size=(1,2)))

    for _ in range(_num_lines):
        point = (
            random_point(_image_size_px, _padding),
            random_point(_image_size_px, _padding),
        )
        points.append(point)
    #find bounding box
    min_x = min([p[0] for p in points])
    max_x = max([p[0] for p in points])
    min_y = min([p[1] for p in points])
    max_y = max([p[1] for p in points])

    #center image
    x_offset = (min_x - _padding) - (_image_size_px - _padding - max_x)
    y_offset = (min_y - _padding) - (_image_size_px - _padding - max_y)
    for i, point in enumerate(points):
        points[i] = (int(point[0] - x_offset//2), int(point[1] - y_offset//2))



    # cv2.line(image,points[0],points[1],color=(0,0,0),thickness=_line_thickness)

    #draw image
    for i in range(_num_lines):

        _line_thickness += 1
        # print(_line_thickness)

        if i == _num_lines-1:
            # cv2.line(image, points[i], points[0], color=_color, thickness=_line_thickness)
            draw.line((points[i],points[0]),fill=_color,width=_line_thickness)
        else:
            # cv2.line(image, points[i], points[i+1], color=_color, thickness=_line_thickness)
            draw.line((points[i],points[i+1]),fill=_color,width=_line_thickness)
    image = image.filter(ImageFilter.GaussianBlur(4))
    image = image.filter(ImageFilter.UnsharpMask(radius=5, percent=200, threshold=3))
    draw = ImageDraw.Draw(image)
    draw.text((410,450),_tokenID, font=_font, fill=(0,0,0))

    return image



def random_point(_image_size_px: int, _padding: int):
    return np.random.randint(_padding, _image_size_px - _padding)

def create_IDs(n: int):
    ids_int = np.arange(1,n+1)
    ids_str = []
    ids_str = [str(ids_str) for ids_str in ids_int]
    for i in range(len(ids_str)):
        if i < 9:
            ids_str[i] = '00' + ids_str[i]
        elif i < 99:
            ids_str[i] = '0' + ids_str[i]
        else:
            pass
    return ids_str

def main():
    tokenIDs = create_IDs(100)
    imgs = Image.open(os.path.join(script_dir, 'ocean.gif')) #open ocean gif

    for i in range(100): #loop for each NFT
        color = random_color() #find random color with alpha of 255
        line = line_image(_color=color,_tokenID=tokenIDs[i]) #create line image
        frames = [] #initialize output array

        for frame in ImageSequence.Iterator(imgs): #loop through each frame of GIF
            frame = frame.copy()
            frame = frame.convert(mode='RGBA')
            blend = Image.alpha_composite(frame,line) #overlay line image onto frame
            frames.append(blend)
        frames[0].save(os.path.join(script_dir,(tokenIDs[i] + '.gif')), save_all=True, append_images=frames[1:]) #save GIF

if __name__ == "__main__":
    main()
