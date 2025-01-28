function exportModel() {
    const data = bestCar.brain.serialize();
    const blob = new Blob([data], {type: "application/json"});
    const link = document.createElement("a");
    link.download = "car-brain.json";
    link.href = URL.createObjectURL(blob);
    link.click();
}
function importModel(event) {
    const file = event.target.files[0];
    if(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                localStorage.setItem("savedBrain", e.target.result);
                loadSavedModel();
            } catch(error) {
                console.error("Invalid model file:", error);
            }
        };
        reader.readAsText(file);
    }
}