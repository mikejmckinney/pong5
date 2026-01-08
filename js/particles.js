/**
 * Particle System - Manages particle effects for ball hits and events
 */

class ParticleSystem {
  constructor() {
    this.particles = [];
    this.particlePool = []; // Object pooling for performance
    this.maxParticles = CONFIG.EFFECTS.MAX_PARTICLES;
    
    // Pre-create particle pool
    for (let i = 0; i < this.maxParticles; i++) {
      this.particlePool.push(this.createParticle());
    }
  }
  
  /**
   * Create a new particle object
   */
  createParticle() {
    return {
      x: 0,
      y: 0,
      velocityX: 0,
      velocityY: 0,
      life: 0,
      maxLife: 0,
      size: 0,
      color: '#ffffff',
      active: false
    };
  }
  
  /**
   * Get an inactive particle from the pool
   */
  getParticle() {
    for (let particle of this.particlePool) {
      if (!particle.active) {
        particle.active = true;
        return particle;
      }
    }
    return null; // Pool exhausted
  }
  
  /**
   * Spawn particles at a position
   */
  spawn(x, y, count, color, speed = 3) {
    for (let i = 0; i < count; i++) {
      const particle = this.getParticle();
      if (!particle) break;
      
      const angle = (Math.PI * 2 * i) / count;
      const velocity = speed + Math.random() * 2;
      
      particle.x = x;
      particle.y = y;
      particle.velocityX = Math.cos(angle) * velocity;
      particle.velocityY = Math.sin(angle) * velocity;
      particle.life = 1.0;
      particle.maxLife = 0.5 + Math.random() * 0.5;
      particle.size = 2 + Math.random() * 3;
      particle.color = color;
      
      this.particles.push(particle);
    }
  }
  
  /**
   * Spawn directional particles (e.g., from paddle hits)
   */
  spawnDirectional(x, y, count, color, direction, spread = 45) {
    for (let i = 0; i < count; i++) {
      const particle = this.getParticle();
      if (!particle) break;
      
      const spreadAngle = (spread * Math.PI / 180);
      const angle = direction + (Math.random() - 0.5) * spreadAngle;
      const speed = 3 + Math.random() * 4;
      
      particle.x = x;
      particle.y = y;
      particle.velocityX = Math.cos(angle) * speed;
      particle.velocityY = Math.sin(angle) * speed;
      particle.life = 1.0;
      particle.maxLife = 0.4 + Math.random() * 0.4;
      particle.size = 2 + Math.random() * 3;
      particle.color = color;
      
      this.particles.push(particle);
    }
  }
  
  /**
   * Update all active particles
   */
  update(deltaTime) {
    const dt = deltaTime / 1000; // Convert to seconds
    
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      // Update position
      particle.x += particle.velocityX;
      particle.y += particle.velocityY;
      
      // Apply gravity/drag
      particle.velocityY += CONFIG.EFFECTS.PARTICLE_GRAVITY;
      particle.velocityX *= CONFIG.EFFECTS.PARTICLE_DRAG;
      particle.velocityY *= CONFIG.EFFECTS.PARTICLE_DRAG;
      
      // Update life
      particle.life -= dt / particle.maxLife;
      
      // Remove dead particles
      if (particle.life <= 0) {
        particle.active = false;
        this.particles.splice(i, 1);
      }
    }
  }
  
  /**
   * Draw all active particles
   */
  draw(ctx) {
    for (let particle of this.particles) {
      const alpha = Math.max(0, particle.life);
      
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.shadowBlur = CONFIG.EFFECTS.PARTICLE_GLOW;
      ctx.shadowColor = particle.color;
      ctx.fillStyle = particle.color;
      
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    }
  }
  
  /**
   * Clear all particles
   */
  clear() {
    for (let particle of this.particles) {
      particle.active = false;
    }
    this.particles = [];
  }
}
