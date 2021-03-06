// 環境變數
var updateFPS = 30
var showMouse = true
var time = 0
var bgColor = 'black'

// 控制
var controls = {
  value: 0,
  gcount: 15,
  ay: 0.6,
  fade: 0.96,
  v: 5,
  r: 10,
  clearForce: function(){
    forcefields = []
  }
}


class Particle{
  constructor(args){
    let def = {
      p: new Vec2(),
      v: new Vec2(1,0),
      a: new Vec2(),
      r: 10,
      color: "#fff"
    }
    Object.assign(def,args)
    Object.assign(this,def)
  }
  draw(){
    ctx.save() 
    ctx.translate(this.p.x,this.p.y)
    ctx.beginPath()
    ctx.arc(0,0,this.r,0,Math.PI*2)
    ctx.fillStyle = this.color
    ctx.fill()
    ctx.restore()
  }
  update(){
    this.p = this.p.add(this.v)
    this.v = this.v.add(this.a)
    this.v.move(0,controls.ay)
    this.v = this.v.mul(0.99)
    this.r*= controls.fade
    
    if( this.p.y+this.r > wh){
      this.v.y = -Math.abs(this.v.y)
    }
    if( this.p.x+this.r > ww){
      this.v.x = -Math.abs(this.v.x)
    }
    if( this.p.y-this.r < 0){
      this.v.y = Math.abs(this.v.y)
    }
    if( this.p.x-this.r < 0){
      this.v.x = Math.abs(this.v.x)
    }
  }
}

class Forcefield{
  constructor(args){
    let def= {
      p: new Vec2(),
      value: 100,
    }
    Object.assign(def,args)
    Object.assign(this,def)
  }
  draw(){
    ctx.save() 
    ctx.translate(this.p.x,this.p.y)
    ctx.beginPath()
    ctx.arc(0,0,Math.sqrt(this.value),0,Math.PI*2)
    ctx.fillStyle = "#fff"
    ctx.fill()
    ctx.restore()
  }
   
  affect(particle){
    let delta = particle.p.sub(this.p)
    let len = this.value/(1+delta.length)
    let force = delta.unit.mul(len)
    particle.v.move(force.x,force.y)
  }
}

//--------------------------
// Vec2
class Vec2{
  constructor(x,y){
    this.x = x || 0
    this.y = y || 0
  }
  set(x,y){
    this.x = x
    this.y = y
  }
  move(x,y){
    this.x += x
    this.y += y
  }
  add(v){
    return new Vec2(this.x+v.x, this.y+v.y)
  }
  sub(v){
    return new Vec2(this.x-v.x, this.y-v.y)
  }
  mul(s){
    return new Vec2(this.x*s, this.y*s)
  }
  get length(){
    return Math.sqrt(this.x*this.x + this.y*this.y)
  }
  set length(nv){
    let temp = this.unit.mul(nv)
    this.set(temp.x,temp.y)
  }
  clone(){
    return new Vec2(this.x ,this.y)
  }
  toString(){
    return `(${this.x}, ${this.y})`
  }
  equal(v){
    return this.x == v.x && this.y == v.y
  }
  get angle(){
    return Math.atan2(this.y, this.x)
  }
  get unit(){
    return this.mul(1/this.length)
  }
}
var a = new Vec2(3,4)


//-----------------

var canvas= document.querySelector('#mycanvas')
var ctx = canvas.getContext('2d')

ctx.circle = function(v,r){
  this.arc(v.x,v.y,r,0,Math.PI*2)
}
ctx.line = function(v1,v2){
  this.moveTo(v1.x, v1.y)
  this.lineTo(v2.x, v2.y)
}

// canvas設定
function initCanvas(){
  ww = canvas.width = window.innerWidth
  wh = canvas.height = window.innerHeight
}
initCanvas()
// 裝粒子的陣列
particles = []
// 裝力場的陣列
forcefields = []
// 邏輯初始化
function init(){
  
}

// 遊戲邏輯更新
function update(){
  time++
  particles = particles.concat(Array.from({length:controls.gcount},(d,i)=>{
    return new Particle({
      p: mousePos.clone(),
      v: new Vec2(Math.random()*controls.v-controls.v/2,Math.random()*controls.v-controls.v/2),
      r: controls.r,
      color: `rgb(255,${parseInt(Math.random()*255)},${parseInt(Math.random()*150)})`
    })
  }))
  particles.forEach(p=>{p.update()})
  var sp = particles.slice()
  
  sp.forEach((p,pid)=>{
    forcefields.forEach(f=>f.affect(p))
    
    if(p.r < 0.5){
      var pp = sp.splice(pid,1)
      delete pp
    }
  })
  particles = sp
}

// 畫面更新
function render(){
  // 清空背景
    ctx.fillStyle= bgColor
    ctx.fillRect(0,0,ww,wh)
  // -------
  // 在這繪製
  // 下方為例子
    particles.forEach(p=>{p.draw()})
    forcefields.forEach(f=>{f.draw()})
  
  //------------
  // 滑鼠
  
  ctx.fillStyle = 'red'
  ctx.beginPath()
  ctx.circle(mousePos,3)
  ctx.fill()
  
  ctx.save()
    ctx.beginPath()  
    ctx.translate(mousePos.x, mousePos.y)
    ctx.strokeStyle = 'red'
    let len = 20
    ctx.line(new Vec2(-len,0), new Vec2(len,0))
  
    ctx.fillText(mousePos,10,-10)
  
    ctx.rotate(Math.PI/2)
    ctx.line(new Vec2(-len,0), new Vec2(len,0))
    ctx.stroke()
  ctx.restore()
  
  requestAnimationFrame(render)
}

// 頁面載入
function loaded(){
  initCanvas()
  init()
  requestAnimationFrame(render)
  setInterval(update,1000/updateFPS)
}
// 載入 縮放的事件
window.addEventListener('load',loaded)
window.addEventListener('resize',initCanvas)

// 滑鼠事件跟紀錄
var mousePos = new Vec2(0,0)
var mousePosDown = new Vec2(0,0)
var mousePosUp = new Vec2(0,0)
window.addEventListener('mousemove',mousemove)
window.addEventListener('mouseup',mouseup)
window.addEventListener('mousedown',mousedown)
window.addEventListener('dblclick',dblclick)

function mousemove(e){
  mousePos.set(e.x,e.y)
  console.log(mousePos)
}
function mouseup(e){
   mousePos.set(e.x,e.y)
  mousePosUp = mousePos.clone()
}
function mousedown(e){
   mousePos.set(e.x,e.y)
  mousePosDown = mousePos.clone()
}
function dblclick(e){
   mousePos.set(e.x,e.y)
   forcefields.push(new Forcefield({
     p: mousePos.clone()
   }))
}
