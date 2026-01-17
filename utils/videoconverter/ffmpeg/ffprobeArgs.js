const ffprobeArgs = (inputFile) => {
  return [
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-show_entries",
    "stream=width,height",
    "-of",
    "csv=p=0:s=x",
    inputFile,
  ];
};

export default ffprobeArgs;
