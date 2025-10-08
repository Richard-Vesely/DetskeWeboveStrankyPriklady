# Boids Flocking Simulation

A web-based implementation of Craig Reynolds' Boids model for simulating flocking behavior with interactive controls.

## What is the Boids Model?

The Boids model, developed by Craig Reynolds in 1986, is a computational model that simulates the coordinated motion of a flock of birds or a school of fish. The model is based on three simple steering behaviors:

1. **Separation**: Steer to avoid crowding local flockmates
2. **Alignment**: Steer towards the average heading of local flockmates
3. **Cohesion**: Steer to move toward the average position of local flockmates

By combining these three rules, complex emergent flocking behavior arises.

## Features

- Interactive HTML5 Canvas simulation
- Adjustable parameters for all aspects of the flocking behavior
- Blue arrow representation for agents (boids)
- Periodic boundary conditions (boids that go off one edge of the screen appear on the opposite edge)
- Click-to-scare behavior with adjustable parameters
- Responsive design

## How to Use

1. Open `index.html` in a web browser
2. Use the sliders to adjust the simulation parameters:
   - Number of Boids: Controls the population of agents
   - Separation Force: How strongly boids avoid each other
   - Alignment Force: How strongly boids match velocities with neighbors
   - Cohesion Force: How strongly boids move toward the center of their local group
   - Perception Radius: How far each boid can "see" other boids
   - Max Speed: Maximum velocity for the boids
   - Scare Radius: The distance at which boids are affected by clicks
   - Scare Force Factor: How strongly boids flee from clicks
   - Scare Effect Duration: How long the scare effect lasts
3. Click anywhere on the simulation to create a "scare point" that repels nearby boids
4. Use the "Reset Simulation" button to restart with the current parameters

## Implementation Details

- No external libraries used - pure JavaScript with HTML5 Canvas for rendering
- Vector mathematics for handling positions, velocities, and forces
- Optimized distance calculations for periodic boundary conditions
- Responsive canvas that adjusts to the window size

## License

This project is open source and available for personal and educational use. 