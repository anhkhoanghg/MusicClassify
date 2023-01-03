var arrayFile = [];

function build() {
  reloadColor();
  reloadButton();
  renderClassifyButton();
  renderDragFileArea();
}

function reloadButton() {
  let reloadButton = document.getElementById("reloadButton");
  reloadButton.onclick = function () {
    changeAnimation("animate__fadeInRight", "animate__fadeOutRight");
    changeAnimation("animate__fadeInDown", "animate__fadeOutDown");

    setTimeout(function () {
      let fileList = document.querySelector(".file-list");
      fileList.innerHTML = "";

      let classifiedTable = document.getElementById("classifiedTable");
      let tbody = classifiedTable.querySelector("tbody");
      tbody.innerHTML = "";

      let tr = document.createElement("tr");
      tr.classList.add("animate__animated", "animate__fadeIn");
      tr.style.backgroundColor = "#000000db";
      tr.innerHTML = `<td><i>Empty Data</i></td><td></td><td></td>`;
      tbody.appendChild(tr);

      arrayFile = [];
    }, 1000);
  };
}

function changeAnimation(first_animation, second_animation) {
  let animationList = document.querySelectorAll(`.${first_animation}`);
  animationList.forEach((animation) => {
    animation.classList.remove(first_animation);
    animation.classList.add(second_animation);
  });
}

function getRandomColor(elem) {
  let requiredArray = ["backgroundColor", "borderColor", "color"];

  for (let index in requiredArray) {
    let randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    elem.style[`${requiredArray[index]}`] = randomColor;
  }
}

function reloadColor() {
  let arrayContainer = document.querySelector(".file-list");

  setInterval(function () {
    let buttonFileNameList =
      arrayContainer.querySelectorAll(".filename-button");
    buttonFileNameList.forEach((button) => {
      getRandomColor(button);
    });
  }, 1500);
}

function processData() {
  console.log(arrayFile.length)
  if (arrayFile.length) {
    for (let index = 0; index < arrayFile.length; index++) {
      console.log("test processData forloop");
      let file = arrayFile[index];

      getDataFromPython(file, function (predictedFile) {
        console.log("test getDataFromPython run");
        renderData(predictedFile);
      });
    }
  } else {
    alert("No file chosen!");
  }
}

function getDataFromPython(file, callback) {
  console.log("test getDataFromPython func");

  let func = `others~${file.name}`;
  let url = `/main/processData/${func}`;


  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "name": file.name,
      "base64": file.pathBase64,
    }),
  })
    .then(response => response.json())
    .then(data => {
      console.log("Respone API", data);
      callback(convertData(data));
    }).catch(err => {
      console.log('API went wrong.', err);
    });
}

function convertBinaryToBlob(dataURI) {
  let binary = convertBase64IntoBinary(dataURI);
  let blob = new Blob([binary], { type: 'audio/wav' });
  let blobUrl = URL.createObjectURL(blob);

  return blobUrl;
}

function convertBase64IntoBinary(dataURI) {
  let BASE64_MARKER = ';base64,';
  let base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
  let base64 = dataURI.substring(base64Index);
  let raw = window.atob(base64);
  let rawLength = raw.length;
  let array = new Uint8Array(new ArrayBuffer(rawLength));

  for (i = 0; i < rawLength; i++) {
    array[i] = raw.charCodeAt(i);
  }
  return array;
}

function convertData(data) {
  console.log(data);

  returnJson = {
    "name": data.name,
    "type": data.type,
    "probility": data.probility.replaceAll("\n", "").replaceAll("\r", ""),
  };

  return returnJson;
}

function renderData(file) {
  let classifiedTable = document.getElementById("classifiedTable");
  let tbody = classifiedTable.querySelector("tbody");

  let name = file.name;
  let type = file.type;
  let probility = file.probility;

  let tr = document.createElement("tr");
  tr.classList.add("animate__animated", "animate__fadeInRight");
  tr.style.backgroundColor = "#000000db";
  tr.innerHTML = `<td>${name}</td><td class="is-capitalized">${type}</td><td>${parseFloat(probility * 100).toFixed(2)}%</td>`;
  tbody.appendChild(tr);
}

function renderClassifyButton() {
  let classifyButton = document.getElementById("classifyButton");
  classifyButton.onclick = function () {
    changeAnimation("animate__fadeIn", "animate__fadeOut");

    let classifiedTable = document.getElementById("classifiedTable");
    let tbody = classifiedTable.querySelector("tbody");

    setTimeout(function () {
      tbody.innerHTML = "";

      processData();
    }, 300);
  };
}

function renderDragFileArea() {
  //selecting all required elements
  const dropArea = document.querySelector(".drag-area"),
    dragText = dropArea.querySelector("header"),
    button = dropArea.querySelector("button"),
    input = dropArea.querySelector("input");
  let file; //this is a global variable and we'll use it inside multiple functions

  button.onclick = () => {
    input.click(); //if user click on the button then the input also clicked
  };

  input.addEventListener("change", function () {
    //getting user select file and [0] this means if user select multiple files then we'll select only the first one
    file = this.files[0];
    dropArea.classList.add("active");
    showFile(dropArea, file);
  });

  //If user Drag File Over DropArea
  dropArea.addEventListener("dragover", (event) => {
    event.preventDefault(); //preventing from default behaviour
    dropArea.classList.add("active");
    dragText.textContent = "Release to Upload File";
  });

  //If user leave dragged File from DropArea
  dropArea.addEventListener("dragleave", () => {
    dropArea.classList.remove("active");
    dragText.textContent = "Drag & Drop to Upload File";
  });

  //If user drop File on DropArea
  dropArea.addEventListener("drop", (event) => {
    event.preventDefault(); //preventing from default behaviour
    //getting user select file and [0] this means if user select multiple files then we'll select only the first one
    file = event.dataTransfer.files[0];

    if (arrayFile.length < 4) {
      showFile(dropArea, file);
    } else {
      alert("Maximum files reached");
      dropArea.classList.remove("active");
      dragText.textContent = "Drag & Drop to Upload File";
    }
  });
}

function showFile(dropArea, file) {
  let dragText = dropArea.querySelector("header");
  let fileType = file.type; //getting selected file type
  let validExtensions = ["audio/wav"]; //adding some valid image extensions in array
  if (validExtensions.includes(fileType)) {
    //if user selected file is an image file
    let fileReader = new FileReader(); //creating new FileReader object
    fileReader.onload = () => {
      // using fileURL as a file to classify
      let fileURL = fileReader.result; //passing user file source in fileURL variable
      let arrayContainer = document.querySelector(".file-list");
      console.log(fileReader, file);

      let div = document.createElement("div");
      div.classList.add(
        "column",
        "is-3",
        "animate__animated",
        "animate__fadeInDown"
      );
      div.innerHTML = `
                <div class="button filename-button">
                    <i class="far fa-file-audio"></i>
                    &nbsp;
                    <span>${file.name}</span>
                </div>`;
      arrayContainer.appendChild(div);
      //adding that created img tag inside dropArea container

      arrayFile.push({
        "type": ((file.name).split("."))[0],
        "name": file.name,
        "pathBase64": fileURL,
        "pathBinary": convertBase64IntoBinary(fileURL),
        "pathBlobUrl": decodeBlobUrl(convertBinaryToBlob(fileURL)),
      });
    };
    fileReader.readAsDataURL(file);

    dropArea.classList.remove("active");
    dragText.textContent = "Drag & Drop to Upload File";
  } else {
    alert("This is not a Wave(.wav) File!");
    dropArea.classList.remove("active");
    dragText.textContent = "Drag & Drop to Upload File";
  }

  function decodeBlobUrl(url) {
    url = url.replaceAll("/", "&forwardslash;").replaceAll(":", "&twodot;").replaceAll(".", "&dot;").replaceAll("-", "&minus;");
    return url
  }
}
