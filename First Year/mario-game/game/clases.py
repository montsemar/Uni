import pyxel
import random

from constants import *


class Manager:
    """ This class is the responsible of creating all elements in the game, except Mario """

    def __init__(self, pos: tuple, map=None, siz=(SIZE, SIZE),
                 img=BANK_DEF, colkey=0):
        # Initial coordinates on screen
        self.x = pos[0]
        self.y = pos[1]

        # Coordinates of where the image is drawn
        if map:
            self.u = map[0]
            self.v = map[1]

        # Size of the image
        self.w = self.width = siz[0]
        self.h = self.height = siz[1]

        # Where if the image drawn
        self.img = img

        # Color
        self.colkey = colkey

    def objects_generator(self, pos_object, lis_obs, map=None):
        """ This method gerenates the different objects in the screen """
        objs = []
        pos = len(pos_object)-1
        while pos >=0:
            # No sprite
            if map != None:
                print(type(pos_object[pos]))
                obj = lis_obs(pos_object[pos], map[pos])
            else:
                obj = lis_obs(pos_object[pos])
            objs.append(obj)
            pos -= 1

        return objs

    def is_colliding(self, os, traza=False):
        """ This function returns if Mario is colliding with an object and which object it is """
        # Mario coordinates
        top, bot, lef, rig = self.y, self.y + self.h, abs(self.x), abs(self.x + self.w)
        op = len(os) - 1

        while op >= 0:
            # Object coordinates
            otop, obot, olef, orig = os[op].y, os[op].y + os[op].h, os[op].x, os[op].x + os[op].w
            if traza:
                print(top, bot, lef, rig, otop, obot, olef, orig)
            if (lef < orig and rig > olef and top < obot and bot > otop):
                bbot, btop, blef, brig = (top - obot), (bot - otop), (rig - olef), (lef - orig)
                dis = min(abs(bbot), abs(btop), abs(blef), abs(brig))
                # Return the object class and where is the object colliding
                if dis == abs(btop):
                    return (os[op], "top")
                elif dis == abs(bbot):
                    return (os[op], "bottom")
                elif dis == abs(blef):
                    return (os[op], "left")
                elif dis == abs(brig):
                    return (os[op], "right")
            op -= 1
        return None

    def objects_draw(self, lis_obs):
        for object in lis_obs:
            object.draw()


    def objects_Counted_draw(self, lis_obs, det, zero):
        pos=len(lis_obs)-1
        while pos >= 0:
            lis_obs[pos].Counted_draw( det[pos], zero)
            pos -= 1

    def draw(self):
        pyxel.blt(self.x, self.y, self.img, self.u, self.v, self.w, self.h, self.colkey)


    def Counted_draw(self,cab, zero):
        text=(cab+'-' + str(self.score).zfill(zero))
        pyxel.text(self.x, self.y, text, self.color)


class Platforms(Manager):
    """ Class of platforms """

    def __init__(self, position, size, map=MAP_PLATA, id=0):
        super().__init__(pos=position, siz=size, map=map)

        # Identify which block-platform Mario is colliding
        self.id = id


class Mario(Manager):
    """ Class which contains Mario's movements """

    def __init__(self, pos, map):

        super().__init__(pos=pos, map=map,colkey=BACKGROUND_COLOR )
        # Initial coordinates on screen
        #self.x = pos[0]
        #self.y = pos[1]

        # How fast is Mario's movement
        self.x_velocity = 0
        self.y_velocity = 0

        # Coordinates of where the image is drawn
        #self.u = map[0]
        #self.v = map[1]

        # Size
        #self.w = S_MARIO
        #self.h = S_MARIO

        # Color
        #self.colkey = BACKGROUND_COLOR

        # Lives
        self.lives = 3

        self.flying = False
        self.floor = False
        self.lower = False

    # DEFINITION OF THE PROPERTIES AND SETTERS
    @property
    def x(self):
        return self.__x

    @x.setter
    def x(self, x):
        self.__x = x

    @property
    def y(self):
        return self.__y

    @y.setter
    def y(self, y):
        self.__y = y

    def update(self, objs):
        """ This method checks Mario's position at all times """
        # Check for collisions with objects
        dir = ""
        collision = self.is_colliding(objs, False)

        # Mario collides with objects - NOT ENEMIES
        if collision != None:
            obj_collision = collision[0]  # What is colliding
            dir = collision[1]  # Where it is colliding


        # Check whether we are colliding or not when pressing buttons
        if pyxel.btn(pyxel.KEY_LEFT) or pyxel.btn(pyxel.KEY_A):
            # Colliding with an object - not pipes
            if collision and dir == "right" and not isinstance(obj_collision, Pipeline):
                self.x = obj_collision.x + self.w
            else:
                if self.x_velocity < SPEED_MAX: self.x_velocity += SPEED_X
                self.x -= max(SPEED_X, self.x_velocity)

                # Change sprite, Mario faces left
                self.u, self.v = MAP_MARIO_LEFT[0], MAP_MARIO_LEFT[1]

        elif pyxel.btn(pyxel.KEY_RIGHT) or pyxel.btn(pyxel.KEY_D):
            # Colliding with an object - not pipes
            if collision and dir == "left" and not isinstance(obj_collision, Pipeline):
                self.x = obj_collision.x - obj_collision.w
            else:
                if self.x_velocity < SPEED_MAX: self.x_velocity += SPEED_X
                self.x += max(SPEED_X, self.x_velocity)

                # Change sprite, Mario faces right
                self.u, self.v = MAP_MARIO_RIGHT[0], MAP_MARIO_RIGHT[1]

        elif pyxel.btnp(pyxel.KEY_SPACE) or pyxel.btn(pyxel.KEY_UP):
            self.floor, self.flying = False, True

            self.y -= max(self.y_velocity, SPEED_Y)
            if self.y_velocity < SPEED_MAX: self.y_velocity += SPEED_Y
            self.floor, self.flying = False, True


        # If Mario is flying
        if self.floor == False:
            if collision != None:
                # Check Mario's position
                if dir == "bottom" or dir == "left":
                    if isinstance(obj_collision, Platforms):  # If under a platform
                        # Check which platform he is colliding to and reposition him
                        if obj_collision.id == 6 or obj_collision.id == 5:
                            self.y = (A_HEIGHT - (SIZE * 2))
                        elif obj_collision.id == 4 or obj_collision.id == 2:
                            self.y = POS_PLATA[6][1] - SIZE
                        elif obj_collision.id == 3:
                            self.y = POS_PLATA[6][1] - S_POW
                        elif obj_collision.id == 0 or obj_collision.id == 1:
                            if self.x < POS_PLATA[2][0] + (SIZ_PLATA[2] * S_PLATA) or (
                                    self.x > POS_PLATA[2][0] + (SIZ_PLATA[2] * S_PLATA) and self.x > POS_PLATA[4][0]):
                                self.y = POS_PLATA[2][1] - SIZE
                            else:
                                self.y = POS_PLATA[6][1] - SIZE

                    # If collision with Pow
                    if isinstance(obj_collision, Pow):
                        self.y = (A_HEIGHT - (SIZE * 2))
                    self.floor = True

                # If Mario is on top of a platform, he stays there
                elif dir == "top":
                    self.y = obj_collision.y - obj_collision.h

                if (isinstance(obj_collision, Platforms) or isinstance(obj_collision, Pow)):
                    # Change variables
                    self.floor, self.flying = True, False

            # If there is no collision
            else:
                bPlata = False
                pos_y = len(objs) - 1  # 7 (0 -> 7)

                # Array of objects, 8
                objs[pos_y]
                while pos_y >= 0:
                    ob = objs[pos_y]
                    if (ob.y + ob.h == self.y) and (isinstance(ob, Platforms) or isinstance(ob, Pow)):
                        bPlata = True
                    pos_y -= 1

                if bPlata == False: self.y -= max(self.y_velocity, SPEED_Y)


        # Limit Mario's movements in the screen
        # WIDTH
        if self.x < 0:
            self.x, self.x_velocity = A_WIDTH - self.w, 0
        elif self.x >= A_WIDTH:
            self.x, self.x_velocity = 0, 0
        # HEIGHT
        self.y = max(0, min(self.y, pyxel.height - (S_MARIO + FLOOR_SIZE)))


        if collision:
            if not isinstance(obj_collision, Platforms):
                print('despues2', type(obj_collision), dir, self.x, self.y, obj_collision.x, obj_collision.y,
                      obj_collision.y + obj_collision.h, self.y_velocity, self.floor, self.flying)
            else:
                print('despues2', type(obj_collision), dir, self.x, self.y, obj_collision.x, obj_collision.y,
                      obj_collision.y + obj_collision.h, self.y_velocity, obj_collision.id, self.floor, self.flying)

        else:
            print(self.x, self.y)



    def reset_position(self, x, y):
        """ This method is used when Mario dies, he appears on top of the screen """
        self.x = x
        self.y = y - FLOOR_SIZE
        self.x_velocity = 0
        self.y_velocity = 0

    #def draw(self):
    #   super().draw()
        #pyxel.blt(self.x, self.y, 0, self.u, self.v, self.w, self.h, self.colkey)

class ManagerCounted(Manager):
    def _init__(self, pos, Counted=0):
        super().__init__(pos=pos)


class CountedScore(Manager):
    def __init__(self,pos,color,Score=0):
        super().__init__(pos=pos)
        self.color = color
        self.score=Score


#class CountedLives():
#    def __init__(self,pos):

class Pipeline(Manager):
    def __init__(self,pos, map):
        super().__init__(pos=pos,map=map)


class Floor(Manager):
    def __init__(self, pos):
        super().__init__(pos=pos, map=MAP_FLOOR)


class Pow(Manager):
    """ This method creates the Pow """

    def __init__(self, pos):
        super().__init__(pos=pos, map=MAP_POW)


class Coin:
    def __init__(self, pos):
        self.x = pos[0]
        self.y = pos[1]
        self.sprite = (0, 32, 16, 16, 16, 0)

    # DEFINITION OF THE PROPERTIES AND SETTERS
    @property
    def x(self):
        return self.__x

    @x.setter
    def x(self, x: int):
        if type(x) == int:
            self.__x = x
        else:
            raise TypeError("X type is not valid, must be int")

    @property
    def y(self):
        return self.__y

    @y.setter
    def y(self, y: int):
        if type(y) == int:
            self.__y = y
        else:
            raise TypeError("Y type is not valid, must be int")

    def draw(self, x: int, y: int):
        pyxel.blt(x, y, *self.sprite)

