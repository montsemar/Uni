import time
import math

from clases import *


class Enemy:
    def __init__(self, x, y, sprite_pos: tuple):
        # Initial coordinates on screen
        self.x = x
        self.y = y

        # Coordinates of where the image is drawn
        self.u = sprite_pos[0]
        self.v = sprite_pos[1]

        # Size
        self.w = SIZE
        self.h = SIZE

        # Color
        self.colkey = BACKGROUND_COLOR

        self.enemies_list = []

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
        """ This method updates the enemy's position at all times """
        direction = random.randint(0, 1)
        if direction == 0:
            self.x -= 1
        else:
            self.x += 1
        self.y += 1

        # Check for collisions with objects
        # collision = self.is_colliding(objs)

        # if collision is not None:
            # obj_collision = collision[0]
            # dir = collision[1]
            # secs = 10

            # If the enemy is on a platform, he stays on top of it
            # if dir == "bottom" and isinstance(obj_collision, Platforms):
                # self.y = obj_collision.y - 16
            # If the enemy is attacked by Mario, it doesn't move.
            # if dir == "bottom" and isinstance(obj_collision, Mario):
                # if self.x < 0:
                    # new_x = self.x - 2
                    # old_x = self.x - 1
                # else:
                    # new_x = self.x + 2
                    # old_x = self.x + 1
                # self.x = 0
                # The enemy stays still for 10 seconds
                # time.sleep(secs)
                # After staying still, the enemy is faster
                # self.x = new_x
                # After 10 seconds, the enemy goes back to normal.
                # counter = 0
                # while counter < secs:
                    # counter -= 1
                # self.x = old_x
        # Enemies can go from one limit of the screen to the other
        if self.x > pyxel.width:
            self.x = 0
        elif self.x < 0:
            self.x = pyxel.width - SIZE
        # Limit enemy's movement within the screen in y-axis
        self.y = max(0, min(self.y, pyxel.height - (SIZE + FLOOR_SIZE)))
        # Update the generate_enemies
        Enemy.generate_enemies(self)

    def generate_enemies(self):
        for num in range(31):
            init_pipe = random.randint(0, 1)
            if init_pipe == 0:
                self.x = 8
            else:
                self.x = pyxel.width - 8
            self.enemies_list.append(Enemy(init_pipe, 8, MAP_TURTLES))
            self.enemies_list.append(Enemy(init_pipe, 8, MAP_CRABS))
            self.enemies_list.append(Enemy(init_pipe, 8, MAP_FLIES))
            self.enemies_list.append(Enemy(init_pipe, 8, MAP_ICICLE))

            self.enemies_list.append(Enemy(random.randint(0, pyxel.width),
                                           random.randint(0, pyxel.height),
                                           MAP_FIREBALL))

        len_objs = len(self.enemies_list)
        counter = 0
        while counter < len_objs:
            for i in self.enemies_list:
                if i.sprite_pos == MAP_TURTLES:
                    i.draw()
                    i.update()
            counter += 1

    def draw(self):
        pyxel.blt(self.x, self.y, 0, self.u, self.v, self.w,
                  self.h, self.colkey)


class Turtles(Enemy):
    def __init__(self, x, y, sprite_pos=MAP_TURTLES):
        super().__init__(x, y, sprite_pos)


class Crab(Enemy):
    def __init__(self, x, y, sprite_pos=MAP_CRABS):
        super().__init__(x, y, sprite_pos)

    def update(self, objs):
        pass
# Check for collisions with objects
# collision = self.is_colliding(objs)

# if collision is not None:
# obj_collision = collision[0]
# dir = collision[1]
# secs = 10

# If the enemy is on a platform, he stays on top of it
# if dir == "bottom" and isinstance(obj_collision, Platforms):
# self.y = obj_collision.y - 16
# If the enemy is attacked by Mario, it doesn't move.
# if dir == "bottom" and isinstance(obj_collision, Mario):
# counter += 1 (crabs only stop moving after two hits)
# if self.x < 0:
# new_x = self.x - 2
# old_x = self.x - 1
# else:
# new_x = self.x + 2
# old_x = self.x + 1
# if counter == 2: (crabs only stop moving after two hits)
# self.x = 0
# The enemy stays still for 10 seconds
# time.sleep(secs)
# After staying still, the enemy is faster
# self.x = new_x
# After 10 seconds, the enemy goes back to normal.
# counter = 0
# while counter < secs:
# counter -= 1
# self.x = old_x


class Fly(Enemy):
    def __init__(self, x, y, sprite_pos=MAP_FLIES):
        super().__init__(x, y, sprite_pos)
        direction = random.randint(0, 1)
        if direction == 0:
            self.x -= 1
        else:
            self.x += 1
        # The flies jump, they don't walk
        self.y -= 5


class Fireball(Enemy):
    def __init__(self, x, y, sprite_pos=MAP_FIREBALL):
        super().__init__(x, y, sprite_pos)
        self.x = x
        self.y = y

    def update(self, objs):
        self.x = time.process_time()
        # Fireballs move in a wave trajectory f(t) = A * sin( 2 * pi * f * t
        # + phase ). A = 16, f = 4 and t = self.x
        self.y = 16*(math.sin(2*math.pi*4*self.x))
