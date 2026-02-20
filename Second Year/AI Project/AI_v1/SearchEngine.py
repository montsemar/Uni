# Required imports
import numpy as np
import networkx as nx
from Boundaries import Boundaries
from Map import EPSILON, MIN_PSI_SCALED

# Number of nodes expanded in the heuristic search (stored in a global variable to be updated from the heuristic functions)
NODES_EXPANDED = 0

def h1(current_node, objective_node) -> np.float32:
    """ First heuristic to implement """
    global NODES_EXPANDED
    h = 0
    # ...
    n_steps = abs(float(current_node[0])-float(objective_node[0])) + abs(float(current_node[1])-float(objective_node[1]))
    h = MIN_PSI_SCALED * n_steps
    NODES_EXPANDED += 1 # PREGUNTAR: isnt this wrong? the fact that we call on h1 to oknow its value does not mean we expanded it
    return h

def h2(current_node, objective_node) -> np.float32:
    """ Second heuristic to implement """
    global NODES_EXPANDED
    h = 0
    # ...
    n_steps = ( (float(current_node[0])-float(objective_node[0]))**2 + (float(current_node[1])-float(objective_node[1]))**2 ) ** 0.5
    h = MIN_PSI_SCALED * n_steps
    NODES_EXPANDED += 1
    return h

def build_graph(detection_map: np.array, tolerance: np.float32) -> nx.DiGraph:
    """ Builds an adjacency graph (not an adjacency matrix) from the detection map """
    # The only possible connections from a point in space (now a node in the graph) are:
    #   -> Go up
    #   -> Go down
    #   -> Go left
    #   -> Go right
    # Not every point has always 4 possible neighbors
    # ...
    # WE WILL ONLY ADD THEM IF the deterction probab of going there is < threshold AND ONLY ADD EDGES IF THE DETECTION PROBAB < thresh
    height, width = detection_map.shape
    G = nx.DiGraph()  # Directed graph
    provisional = []
    # the nodes must be array too
    for i in range(0, height):
        for j in range(0, width):
            current_node = (np.float32(i), np.float32(j)) # # our graph uses (x-coord, y-coord) ie (lat-converted, lon-converted) like  detection map
            current_cost = detection_map[i, j] # inverted

            # Add the node only if detection is below the threshold
            if current_cost < tolerance:
                G.add_node(current_node) 
                provisional.append(current_node)
            else:
                # debugging
                print(f"current_node {current_node} has current_cost {current_cost}\n")

    for i in range(0, height):
        for j in range(0, width):
            # Check each of the 4 neighbors
            current_node = (np.float32(i), np.float32(j)) # # we save it inverted
            if current_node in list(G.nodes):
                for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                    ni = i + dx     # i + 1 is the right movement, i + 0, i - 1
                    nj = j + dy
                    # Make sure neighbor is within bounds
                    if 0 <= ni < height and 0 <= nj < width:
                        neighbor_cost = detection_map[ni, nj] # inverted
                        if neighbor_cost < tolerance:
                            neighbor_node = (np.float32(ni), np.float32(nj))

                            # You can set edge weight to the destination cost (or average, or 1, depending on your needs)
                            G.add_edge(current_node, neighbor_node, weight=neighbor_cost)
    print("these are the nodes of G generated: ")
    print(G.nodes)
    print("\n")
    return G



def discretize_coords(high_level_plan: np.array, boundaries: Boundaries, map_width: np.int32, map_height: np.int32) -> np.array:
    """ Converts coordiantes from (lat, lon) into (x, y) """
    # ...
    HLP_coords  = np.empty(shape=(len(high_level_plan)),  dtype=object) # [(1.0, 2.0) (1.0, 2.0) (1.0, 2.0) ...]
    
    h_increment = boundaries.max_lat - boundaries.min_lat
    w_increment = boundaries.max_lon - boundaries.min_lon
    h_increment_per_cell = h_increment / map_height
    w_increment_per_cell = w_increment / map_width
    i = 0
    for poi in high_level_plan:
        lat = poi[0]
        lon = poi[1]
        y = round((lat - boundaries.min_lat) / h_increment_per_cell, 0)
        x = round((lon - boundaries.min_lon) / w_increment_per_cell, 0)

        HLP_coords[i] = (y, x) # 
        i += 1

    return HLP_coords

def path_finding(G: nx.DiGraph,
                 heuristic_function,
                 locations: np.array, # PREGUNTA: en base a que ordeno los POIs
                 initial_location_index: np.int32, # PREGUNTA: que es esto ?
                 boundaries: Boundaries,
                 map_width: np.int32,
                 map_height: np.int32) -> tuple:
    """ Implementation of the main searching / path finding algorithm """
    ...
    # PREGUNTA: is this POI1->POI2 or the  whole process | it returns (g, h) o que 
    # PREGUNTA: devueleve solution_plan, nodes_expanded????????????????????
    solution_plan = []
    # 1) decide a "high level plan"
    high_level_plan = decide_HLP(locations, initial_location_index)
    HLP_coords = discretize_coords(high_level_plan, boundaries, map_width, map_height) # to know which specific cells we must go to
    print("HLP_coords")
    print(HLP_coords)
    print("\n")
    
    # 2) A* algo in each of the pairs    Python networkx library, called 
    num_pairs = len(HLP_coords) - 1
    for i in range(0, num_pairs):
        print("this is HLP's POI " + str(i) + ": " + str(HLP_coords[i]) ) # debug
        
        # check if the first node HLP_coords[0] is actually not included bc it had probability of detection > tolerance
        if i == 0 and HLP_coords[i] not in list(G.nodes):
            print(f"HLP_coords[{i}] = {HLP_coords[i]} WHILE G.nodes = {G.nodes}")
            print("starting point is not part of the graph bc of detection probab too high")
        

        try:
            astar_path = nx.astar_path(G, HLP_coords[i], HLP_coords[i+1], heuristic=heuristic_function, weight='weight')
            path_as_strings = [str(node) for node in astar_path]
        except nx.NetworkXNoPath as e:
            #path_as_strings = [] 
            print(f"NetworkXNoPath ERROR:!!!!!!!!!!!!! {e}") # i am not sure we can do this
            solution_plan = []
            break
        except nx.NodeNotFound as e:
            #path_as_strings = [] 
            print(f"NodeNotFound ERROR:!!!!!!!!!!!!! {e}")
            solution_plan = []
            break
            

        solution_plan.append(path_as_strings) # we append the subpaths here
        """if i == num_pairs - 1:
            solution_plan.append(astar_path)
        else:
            solution_plan.append(astar_path[0:-1])"""


    return solution_plan, NODES_EXPANDED

def decide_HLP(locations: np.array, 
               initial_location_index: np.int32):
    """auxiliary: decides order in which we visit the POIs by using the manhattan distance"""
    inital_POI = locations[initial_location_index]
    
    high_level_plan = sorted(locations, key=lambda curr: manhattan_distance(curr, inital_POI))
    return high_level_plan

def manhattan_distance(c1, c2):
    """auxiliary"""
    return abs(c1[0]-c2[0]) + abs(c1[1]-c2[1])


def compute_path_cost(G: nx.DiGraph, solution_plan: list) -> np.float32:
    """ Computes the total cost of the whole planning solution """
    # ...
    print("[@compute_path_cost] This is solution_plan " + str(solution_plan))
    cost = 0
    
    for i in range(0, len(solution_plan)):
        num_pairs = len(solution_plan[i]) - 1
        for j in range(num_pairs):
            cost += G[eval(solution_plan[i][j])][eval(solution_plan[i][j+1])]['weight']
    return cost