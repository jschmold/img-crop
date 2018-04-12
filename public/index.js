"use strict"

/**
 * A class that exposes cropping abilities when applied to a canvas
 */
class Cropper {
  /**
   * Retrieve a 2d context
   */
  get Context() {
    return this.canvas.getContext('2d')
  }

  /**
   * Create a cropper canvas
   * @param {HTMLCanvasElement} canvas The canvas element this is to be bound
   * @param {string} src The image source
   */
  constructor(canvas, src) {
    /** The canvas element */
    this.canvas = null
    /** The image object */
    this.image = null
    /** The dimensions and */
    this.viewPosition = null
    /** A number indicating the level of zoom */
    this.zoom = 1
    /**
     * The object containing the mouse tracking data.
     */
    this.mouseDetails = {
      isMouseDown: false,
      lastX: null,
      lastY: null,
    }
    this.canvas = canvas
    /** The view acts like a camera */
    this.viewPosition = {
      x: 0,
      y: 0,
    }
    
    canvas.onmousemove = this.mouseMove.bind(this)
    canvas.onmousedown = this.mouseDown.bind(this)
    canvas.onmouseup = this.mouseUp.bind(this)

    this.loadImage(src)
      .then(() => {
        this.resetOrientation()
        this.redraw()
      })
  }

  /**
   * Only draws the image
   */
  drawImage() {
    this.Context.drawImage(
      this.image, 
      this.viewPosition.x,
      this.viewPosition.y,
      this.canvas.width * this.zoom,
      this.canvas.height * this.zoom,
      // Start at (0, 0) for drawing, and fill the canvas
      0, 0, this.canvas.width, this.canvas.height,
    )
  }

  /**
   * Load an image into this object asynchronously
   * @param {string} src The image link
   */
  loadImage(src) {
    return new Promise((resolve, reject) => {
      this.image = new Image()
      this.image.src = src
      this.image.onload = resolve
    })
  }

  /**
   * Draw a white background before drawing the image
   */
  redraw() {
    let context = this.Context
      context.clearRect(0, 0, this.canvas.width, this.canvas.height)
      context.fillStyle = "white";
      context.fillRect(0, 0, this.canvas.width, this.canvas.height)
    this.drawImage()
  }

  // EVENT HANDLERS
  
  /** The handling for the mouse release */
  mouseUp() {
    this.mouseDetails.isDown = false
    this.mouseDetails.lastX = null
    this.mouseDetails.lastY = null
  }
  /** The handling for the mouse depress */
  mouseDown(evt) {
    this.mouseDetails.isDown = true
    this.mouseDetails.lastX = evt.clientX
    this.mouseDetails.lastY = evt.clientY
  }

  /** The mouse movement, and moving the image about the canvas */
  mouseMove(evt) {
    if (!this.mouseDetails.isDown) return
  
    // Take the pixel-change (since the canvas is 1:1 with the page)
    let xDif = (evt.clientX - this.mouseDetails.lastX)
    let yDif = (evt.clientY - this.mouseDetails.lastY)
  
    // Apply the zoom modifier
    let newX = xDif * this.zoom
    let newY = yDif * this.zoom
    
    // Modify the location
    this.viewPosition.x -= newX
    this.viewPosition.y -= newY
    
    // Update the mouse tracking data
    this.mouseDetails.lastX = evt.clientX
    this.mouseDetails.lastY = evt.clientY
  
    // Perform a redraw now that everything is ready
    this.redraw()
  }

  // Image Manipulators

  /**
   * Increment the zoom by a strength (negatives work)
   * @param {number} amt The zoom quantity
   * @param {number} strength How powerful the zoom modifier is
   */
  modifyZoomBy(amt, strength = 100) {
    console.log('Zoom ' +  amt / strength)
    let oldZoom = this.zoom
    this.zoom -= amt / strength
  
    let zoomDif = oldZoom - this.zoom
    this.viewPosition.x += (zoomDif * this.canvas.width) / 2
    this.viewPosition.y += (zoomDif * this.canvas.height) / 2
    
    this.redraw()
  }

  /**
   * Horizontally center the image about the canvas
   */
  centerImageX() {
    this.viewPosition.x = -((this.canvas.width * this.zoom) / 2) + (this.image.width / 2)
  }

  /**
   * Vertically center the image about the canvas
   */
  centerImageY() {
    this.viewPosition.y = -((this.canvas.height * this.zoom) / 2) + (this.image.height / 2)    
  }

  /**
   * Horizontally and vertically center the image about the canvas
   */
  centerImageBoth() {
    this.centerImageX()
    this.centerImageY()
  }

  /**
   * Fit the image to the canvas
   * @description Set the zoom to 1:1 if the canvas is square. If it is not, fit the 
   * appropriate dimension to the canvas (landscape canvas = fit width, portrait = fit height)
   */
  fitImage() {
    // Ensure 1:1 canvases are taken care of immediately
    this.zoom = this.image.height / this.canvas.height
    // What is the ratio of the canvas?
    let canvasRatio = this.canvas.width / this.canvas.height
    // Apply landscape, if not, apply portrait
    if (canvasRatio > 1) {
      this.zoom = this.image.width / this.canvas.width
    } else if (canvasRatio < 1) {
      this.zoom = this.image.height / this.canvas.height
    }
  }
  
  /**
   * Fit the image to the screen, and center it
   */
  resetOrientation() {
    this.fitImage()
    this.centerImageBoth()
  
    this.redraw()
  }

  /**
   * Export the canvas as an octet stream
   */
  export() {
    return this.canvas.toDataURL("image/png").replace("image/png", "image/octet-stream")
  }
}



let canvasContainer = document.getElementById('cropCanvas')
let cropper = new Cropper(canvasContainer, '0.jpg')


/**
 * Set the orientation to a preset defined in this function
 * @param {string} obj 
 */
function setContainerOrientation(evt) {
  switch(evt.toLowerCase()) {
    case "wide":
      cropper.canvas.height = 250
      cropper.canvas.width = 400
      break
    case "equal": 
      cropper.canvas.width = 400
      cropper.canvas.height = 400
      break
    case "high":
      cropper.canvas.height = 400
      cropper.canvas.width = 250
      break
  }
  canvasContainer.parentElement.style.width = cropper.canvas.width + 'px'
  canvasContainer.parentElement.style.height = cropper.canvas.height + 'px'
  cropper.redraw()
}

/**
 * Delete the preview image source
 */
function clearPreview() {
  document.getElementById('preview').src = null
}

/**
 * Save the contents of the canvas
 */
function save() {
  document.getElementById('preview').src = cropper.export()
}

setContainerOrientation('equal')