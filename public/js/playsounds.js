var BD;
var SD;
var HH1;
var HH2;
var CYM;

var scale;
var P1;
var P2;
var drum;
var lead;
var env;
var arp;
var arp0;
var arp1;
var arp2;
var delay;
var inv;

var noteOffset = 0;
var feedbackAmount = 0;
var playArp0 = false;
var playArp2 = false;

T("audio").load("./drumkit.wav", function() {
  BD  = this.slice(   0,  500).set({bang:false});
  SD  = this.slice( 500, 1000).set({bang:false});
  HH1 = this.slice(1000, 1500).set({bang:false, mul:0.2});
  HH2 = this.slice(1500, 2000).set({bang:false, mul:0.2});
  CYM = this.slice(2000).set({bang:false, mul:0.2});
  scale = new sc.Scale([0,1,3,7,8], 12, "Pelog");

  newScale = new sc.Scale.major().degrees() // [0, 2, 4, 5, 7, 9, 11]


  P1 = [
    [BD, HH1],
    [HH1],
    [HH2],
    [],
    [BD, SD, HH1],
    [HH1],
    [HH2],
    [SD],
  ].wrapExtend(128);

  P2 = sc.series(16);

  drum = T("lowshelf", {freq:110, gain:8, mul:0.6}, BD, SD, HH1, HH2, CYM).play();
  lead = T("saw", {freq:T("param")});
  env  = T("perc", {r:200});
  arp0  = T("OscGen", {wave:"sin(15)", env:env, mul:0.5});
  arp1  = T("OscGen", {wave:"sin(15)", env:env, mul:0.5});
  arp2  = T("OscGen", {wave:"sin(15)", env:env, mul:0.5});

  delay = T("delay", {time:"BPM128 L4", fb:feedbackAmount, mix:0.35},
            T("pan", {pos:T("tri", {freq:"BPM64 L1", mul:0.8}).kr()}, arp0, arp1, arp2)
           ).play();

  inv = T("interval", {interval:"BPM128 L16"}, function(count) {
    var i = count % P1.length;
//    if (i === 0) CYM.bang();

//    P1[i].forEach(function(p) { p.bang(); });

    if (Math.random() < 0.015) {
      var j = (Math.random() * P1.length)|0;
      P1.wrapSwap(i, j);
      P2.wrapSwap(i, j);
    }

    // var noteNum = scale.wrapAt(P2.wrapAt(count)) + 60;
    var noteDegree = newScale.wrapAt(count);
    var noteHz0 = sc.Scale.major().degreeToFreq(noteDegree, (60 + noteOffset).midicps(), 0);
    var noteHz1 = sc.Scale.major().degreeToFreq(noteDegree, (60 + noteOffset).midicps(), 1);
    var noteHz2 = sc.Scale.major().degreeToFreq(noteDegree, (60 + noteOffset).midicps(), 2);
    
    if (i % 2 === 0) {
//      lead.freq.linTo(noteNum.midicps() * 2, "100ms");
      arp0.noteOnWithFreq(noteHz0, playArp0 ? 80 : 0);
      arp1.noteOnWithFreq(noteHz1, 80);
      arp2.noteOnWithFreq(noteHz2, playArp2 ? 80 : 0);
    }
  }).start();
});

var socketConnection = io.connect('http://10.10.0.84:8080/soundsocket');

socketConnection.on('connect', function () {
  console.log('connected to socket');
});

socketConnection.on('potentiometer', function (value) {
  console.log(value)
});

socketConnection.on('button', function (value) {
  console.log(value)
});
