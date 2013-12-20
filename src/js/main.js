/*jslint node: true*/
/*jslint browser: true,sloppy:true,quotmark:false*/
/*global Raphael,$,ko,confirm,PIXI,Phaser,Stats,unescape,SoundManager, x2js*/
/*jslint multistr: true */
"use strict";
(function () {

  var game,
    semebreve,
    speed = 2,
    speedCounterReset = 5,
    speedCounter = 5,
    background,
    width = 800,
    height = 600,
    active = true,
    currentNote,
    wobbleCounter,
    score = 0,
    scoreMC,
    noteArray = [{
      name: "F",
      y: 40,
      buttonX: 460

    }, {
      name: "E",
      y: 50,
      buttonX: 410

    }, {
      name: "D",
      y: 60,
      buttonX: 360
    }, {
      name: "C",
      y: 70,
      buttonX: 310
    }, {
      name: "B",
      y: 80,
      buttonX: 260
    }, {
      name: "A",
      y: 90,
      buttonX: 210
    }, {
      name: "G",
      y: 100,
      buttonX: 160
    }, {
      name: "F",
      y: 110,
      buttonX: 110
    }, {
      name: "E",
      y: 120,
      buttonX: 60

    }, {
      name: "D",
      y: 130,
      buttonX: 10
    }];

  function preload() {
    game.load.image('background', 'assets/background.jpg');
    game.load.image('treble', 'assets/treble_clef.png');
    game.load.spritesheet('semebreve', 'assets/semebreve.png',40,22,5);
    game.load.spritesheet('btn', 'assets/button.png', 50, 120, 4);

  }

  function create() {

    game.stage.scaleMode = Phaser.StageScaleMode.FIXED;
    //game.stage.scale.setShowAll();

    //add background
    background = game.add.sprite(0, 0, 'background');
    var treble = game.add.sprite(12,17,'treble');
    treble.alpha=.30;
    var line5F = game.add.graphics(0, 50);
    createScoreLine(line5F);

    var line4D = game.add.graphics(0, 70);
    createScoreLine(line4D);

    var line3B = game.add.graphics(0, 90);
    createScoreLine(line3B);

    var line2G = game.add.graphics(0, 110);
    createScoreLine(line2G);

    var line1E = game.add.graphics(0, 130);
    createScoreLine(line1E);

    semebreve = game.add.sprite(800, 0, 'semebreve');


    for (var i in noteArray) {
      createAButton(noteArray[i]);
    }

    //add scores:
    var text = score + "";
    var style = {
      font: "20px Arial",
      fill: "#ff0044",
      align: "left"
    };

    scoreMC = game.add.text(10, 5, text, style);

    pickNote();
  }

  function createAButton(note) {
    var offset = 140;
    var offsetY = 440;
    var button = game.add.sprite(note.buttonX + offset, offsetY, 'btn');
    //enables all kind of input actions on this image (click, etc)
    button.inputEnabled = true;
    var text = note.name;
    var style = {
      font: "20px Arial",
      fill: "#332244",
      align: "center"
    };
    game.add.text(note.buttonX + offset + 18, offsetY + 35, text, style);
    button.events.onInputDown.add(buttonPress, this);
    button.events.onInputUp.add(buttonUp, this);
    button.events.onInputOut.add(buttonUp, this);

    note.button = button;

  }

  function buttonPress(e) {
    console.log(e);
    e.frame = (1);
    if (currentNote.button === e) {
      markScore(true);
      semebreve.hit = true;

      var tween = game.add.tween(semebreve).to({
        x: e.x,
        y: e.y
      }, 200, Phaser.Easing.Linear.Out, true);
      tween.onComplete.add(pickNote, this);
      e.frame = 3;
      //pickNote();
    } else {

      e.disabled = true;
    }
  }

  function buttonUp(e) {
    if (e.disabled) {
      e.frame = 2;
    }
    if (e.frame === 1) {
      e.frame = (0);
    }
  }

  function createScoreLine(line) {
    line.beginFill(0x333333);
    line.lineStyle(4, 0x333333, 1);
    // draw a shape
    line.moveTo(0, 0);
    line.lineTo(800, 0);
    line.endFill();
  }

  function update() {
    if (active) {
      if (semebreve.x < -50) {
        markScore(false);
        pickNote();

      } else if (semebreve.x < 30) {
        animateFail();
      }else if (semebreve.x < 100) {
        semebreve.frame=3;
      }else if (semebreve.x < 250) {
        semebreve.frame=2;
      }else if (semebreve.x < 350) {
        semebreve.frame=1;
      }
      if (!semebreve.hit) {
        semebreve.x -= speed;
      }
    }


  }

  function animateFail() {
    background.x = 0;
    wobbleCounter = 0;
    semebreve.frame=4;
    wobble();
  }

  function wobble() {
    wobbleCounter++;
    if (wobbleCounter >= 10) {
      background.x = 0;
      background.y = 0;
      return;
    }
    var tween = game.add.tween(background);
    tween.to({
      x: (Math.random() * 20) - 10,
      y: (Math.random() * 20) - 10,
    }, 80, Phaser.Easing.Elastic.Out);
    tween.onComplete.add(wobble, this);


    tween.start();
  }


  function markScore(success) {
    if (success) {
      score += 10;
    } else {
      score -= 10;
    }
    scoreMC.content = score + "";
  }

  function pickNote() {
    semebreve.x = 830;
    semebreve.frame = 0;
    semebreve.hit = false;
    //var item = items[Math.floor(Math.random()*items.length)];
    currentNote = noteArray[Math.floor(Math.random() * noteArray.length)];
    console.log(currentNote);
    semebreve.y = currentNote.y - 2; //-2 is to offset sprite;
    resetButtons();
    speedCounter--;
    if (speedCounter === 0) {
      if (speed < 20) {
        speed += 1;
      }
      speedCounter = Number(speedCounterReset);
    }

  }

  function resetButtons() {
    for (var i in noteArray) {
      noteArray[i].button.frame = 0;
      noteArray[i].button.disabled = false
    }
  }
  game = new Phaser.Game(width, height, Phaser.AUTO, 'phaser-example', {
    preload: preload,
    create: create,
    update: update
  });

  window.game = game;

}());