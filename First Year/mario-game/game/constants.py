""" SCREEN """
# Zona de dibujo
A_WIDTH = 250
A_HEIGHT = 160

POS_DEFAULT = (0, 0)

# Screen size
WIDTH = 350
HEIGHT = 200
FPS = 60
TIME = 300

SIZE = 16
FLOOR_SIZE = 16

IMG_DEF = (-SIZE * 16, 0)
BANK_DEF = 0
BACKGROUND_COLOR = 0

""" MARIO """
# Sprite
SPEED_MAX = 2
SPEED_X = 0.25
SPEED_Y = 3
MAP_MARIO_RIGHT = (0, 32)
MAP_MARIO_LEFT = (0, 48)
S_MARIO = SIZE
POS_INI_MARIO = ((A_WIDTH / 2) - S_MARIO, (A_HEIGHT - (S_MARIO + FLOOR_SIZE)))

""" PLATAFORMAS """
S_PLATA = 8
COLOR_PLATA = 3

# Posiciones de las plataformas
POS_PLATA = [(1, 30), (153, 30), (1, 70), (104, 60), (178, 70), (1, 107),
             (161, 107)]

# Bloques por plataforma
SIZ_PLATA = [12, 12, 9, 5, 9, 11, 11]

# Tamaño de cada plataforma
SIZE_PLATA = [(85, 5), (85, 5), (63, 5), (70, 5), (63, 5), (90, 5), (90, 5)]

# Sprite de la plataforma
MAP_PLATA = (48, 32)

# Lista donde vamos a crear las plataformas
Fixed = []

""" PIPES - TUBERIAS """
# Tabulaciones
TAB = 1

# Sprite
#MAP_PIPE = (0, 32)

# Size
S_PIPE = SIZE

# Se me olvidó q es
H_PIPE = SIZE * 10

# Sprites de cada pipe
MAP_PIPE1 = (48, 0)
MAP_PIPE2 = (64, 0)
MAP_PIPE3 = (16, 32)
MAP_PIPE4 = (32, 16)

# Posiciones de cada pipe
POS_PIPE = [(TAB,4),(A_WIDTH-(SIZE+TAB),4),(TAB,(A_HEIGHT-(SIZE+TAB))-FLOOR_SIZE),((A_WIDTH-(SIZE+TAB)),(A_HEIGHT-(SIZE+TAB)-FLOOR_SIZE))]
MAP_PIPE = [MAP_PIPE1, MAP_PIPE2, MAP_PIPE3, MAP_PIPE4]

""" COINS """
# Sprite
MAP_COIN = (32, 16)

""" FLOOR """
# Sprite
MAP_FLOOR = (48, 16)

# Posiciones
POS_FLOOR = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
FLOOR = []
for pos in POS_FLOOR:
    FLOOR.append(((pos * SIZE), (A_HEIGHT - SIZE)))

""" POW """
# Tamaño
S_POW = SIZE

# Sprite
MAP_POW = (32, 32)

# Posicion
POS_POW = [(115, POS_PLATA[6][1])]

# Creacion del pow
POW = []
for pos in POS_POW:
    POW.append(pos)

""" ENEMIES - ENEMIGOS """
# Sprites de los enemigos
MAP_TURTLES = (16, 32)
MAP_CRABS = (16, 0)
MAP_FLIES = (16, 16)
MAP_ICICLE = (32, 0)
MAP_FIREBALL = (0, 16)

# Total number of enemies
NUM_ENEMY = 30
TURTLES = [(MAP_TURTLES, "turtles")]
CRABS = [(MAP_CRABS, "crabs")]
ICICLE = [(MAP_FLIES, "icicle")]
FIREBALL = [(MAP_TURTLES, "fireball")]

# Lista con todos los enemigos creados
ENEMIES = []
for i in TURTLES:
    ENEMIES.append(i)
for i in CRABS:
    ENEMIES.append(i)
for i in ICICLE:
    ENEMIES.append(i)
for i in FIREBALL:
    ENEMIES.append(i)



MAX_ZERO = 5
SCORES_DETA=0
SCORES_COLOR=1
POS_SCORES= [(30, 1),(80,1)]
DET_SCORES = [('TOP',7),('I',6)]

