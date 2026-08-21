i need you to update the code, so that on the 'pack to epub' i will do have option to add chapter ornament and subchapter ornament with the below predefine css, if user use chapter ornament then only inject chapter ornament related css, if just sub chapter then inject only subchapter, if chose both then inject both. and if on the raw txt when input the @@@ will converted to h1 but it with class .break-main-chap, so when see that class ignore dont inject ornament ontop of it cause i dont need that.

here is the html code example after injected <div class="chapter-ornament">

    <img src="../images/pre-chap.png" alt=""/>

  </div>

  <h1 id="heading-1-8" class="main-chap center">CUỐN I</h1>

  <div class="subchapter-ornament">

    <img src="../images/pre-small-chap.png" alt=""/>

  </div>

  <h2 id="heading-2-9" class="side-chap center">1</h2>

so, make sure you take the input images by user and changed its name accordingly too

.chapter-ornament {
text-align: center;
margin-top: 1.5em;
margin-bottom: -1.5em;
padding: 0;
}
.chapter-ornament img {
display: inline-block;
max-width: 25%;
max-height: 60px;
height: auto;
width: auto;
}
.subchapter-ornament {
text-align: center;
margin-top: 1.5em;
margin-bottom: 0.3em;
padding: 0;
}
.subchapter-ornament img {
display: inline-block;
width: 5em;
max-width: 80px;
height: auto;
}
