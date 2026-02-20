import pyxel
import random
from enemies import Enemy
from constants import *
from clases import *

class Board:
    def __init__(self, width, height):
        self.width = width
        self.height = height

        # Initialization of the game
        pyxel.init(A_WIDTH, A_HEIGHT, title="Mario", fps=FPS)
        pyxel.load("assets/mario_resource.pyxres")

        # We generate all the objects calling the class Manager
        self.listObjet = []
        self.listObjet += Manager.objects_generator(self, POS_PIPE, Pipeline, MAP_PIPE)
        self.listObjet += self.generate_platforms()
        self.listObjet += Manager.objects_generator(self, POW, Pow)
        self.listObjet += Manager.objects_generator(self, FLOOR, Floor)
        #self.listObjet += Manager.objects_generator(self, ENEMIES, Enemy)


        # Mario is created in the class Mario
        self.mario = Mario(POS_INI_MARIO,MAP_MARIO_RIGHT)

        color = (DET_SCORES[0][SCORES_COLOR],DET_SCORES[1][SCORES_COLOR])

        self.Counted = Manager.objects_generator(self, POS_SCORES, CountedScore, color )


        # Run the program
        pyxel.run(self.update, self.draw)

    def generate_platforms(self):
        """ This method's function is to create the platforms """
        platforms = []
        size = len(POS_PLATA) # Total of 7 platforms
        pos = 0
        # For each platform
        while pos < size:
            num_ele = SIZ_PLATA[pos]
            ele = 0

            # Coordinates of the platform
            x = POS_PLATA[pos][0]
            y = POS_PLATA[pos][1]

            pos_ini = len(platforms) # Number of blocks per platform

            # For each block of each platform, we create them
            while ele < num_ele:
                width = S_PLATA
                height = S_PLATA
                platforms.append(Platforms((x, y), (width, height), id=pos))

                x += width # Go to next block
                ele += 1

            # Check the width of each platform
            ele = 0
            while ele < num_ele:
                platforms[ele + pos_ini].width = x
                ele += 1
            pos += 1

        return platforms

    def update(self):
        """ This method will check everything at all times """
        self.mario.update(self.listObjet)


    def draw(self):
        """ This method will draw the game on the screen """
        # Background of colour black
        pyxel.cls(0)

        # Call class Manager to draw the objects
        Manager.objects_draw(self, self.listObjet)

        det = (DET_SCORES[0][SCORES_DETA], DET_SCORES[1][SCORES_DETA])
        Manager.objects_Counted_draw(self, self.Counted, det, MAX_ZERO)

        # Draw Mario
        self.mario.draw()



# Game on
Board(WIDTH, HEIGHT)
