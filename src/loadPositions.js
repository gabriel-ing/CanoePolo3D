
export const loadPositions = async (width, height) => {
  console.log(document.getElementById("animation-file-input").value);
  let positions;


  let file = document.getElementById("animation-file-input").files[0];
  if (!file) {
    alert("No file selected");
    return;
  }
  const reader = new FileReader();
  reader.onload = async function (event) {
    console.log(event);
    try {
      const positions = JSON.parse(event.target.result); // Parse file content as JSON

      const scaledPositions = scaleData(positions, width, height)
      
      window.states = scaledPositions
    //   window.ballStates = scaledPositions.ballStates;
    //   document.getElementById("state-count").innerHTML = window.states.length;
      console.log(window.states);
    } catch (error) {
      alert("Error - failed to read file");
      console.error(error);
    }
  };

  reader.readAsText(file); // Read file as text
};

export const scaleData = (data, width, height) => {

  
    const dataWidth = data.width;
    const dataheight = data.height;
  
    const scaledBallStates = data.ballStates.map((d) => {
      d.x = (d.x * width) / dataWidth;
      d.y = (d.y * height) / dataheight;
      return d;
    });
  
    const scaledBoatStates = data.boatStates.map((d) =>
      d.map((v) => {
        v.x = (v.x * width) / dataWidth;
        v.y = (v.y * height) / dataheight;
        if (!Object.hasOwn(v, "r")){
            v.r = v.r0
        }
        return v;
      })
    );
  
    return { boatStates: scaledBoatStates, ballStates: scaledBallStates };
  };
  