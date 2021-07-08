import _ from "lodash";
import { action, extendObservable } from "mobx";
import { IconButton, Button } from "@material-ui/core";
import Icon from "@material-ui/core/Icon";
import { Stage, Layer, Line, Image } from "react-konva";
import { withStyles } from "@material-ui/core/styles";
import ColorPicker from "material-ui-color-picker";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
// import fetchOrientedFormImage from '../../api/fetchOrientedFormImage'

import PropTypes from "prop-types";
import React from "react";
import Slide from "@material-ui/core/Slide";
import useImage from "use-image";

let stageWidth = 700;
let stageHeight = 700;

const LoadImage = ({ url }) => {
  const [image] = useImage(url, "Anonymous");
  if (!image) {
    return null;
  } else {
    stageWidth = image.width;
    stageHeight = image.height;
    return <Image image={image} />;
  }
};

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

class AnnotationDialog extends React.Component {
  static propTypes = {
    briefing: PropTypes.object,
    mediaId: PropTypes.string,
    onChange: PropTypes.func,
    onClose: PropTypes.func,
    open: PropTypes.bool,
    classes: PropTypes.object
  };
  static defaultProps = {
    onChange: _.noop,
    onClose: _.noop
  };

  constructor(props) {
    super(props);
    this.stageRef = React.createRef();
    this.layerRef = React.createRef();
    this.containerRef = React.createRef();
    extendObservable(this, {
      objectUrl: null,
      error: null,
      colorPickerOpen: false
    });
  }

  state = {
    redoList: [],
    undoList: [],
    lines: [],
    isDrawing: false,
    annotationColor: "#f37421",
    displayColorPicker: false
  };

  componentDidMount() {
    const { briefing, mediaId } = this.props;

    // return fetchOrientedFormImage(
    //   briefing.companySlug,
    //   briefing.briefingId,
    //   mediaId
    // )
    //   .then(
    //     action((objectUrl) => {
    //       this.objectUrl = objectUrl;
    //     })
    //   )
    //   .catch(
    //     action((error) => {
    //       console.error("error loading image", error);
    //       this.error = error;
    //     })
    //   );
  }

  handleCancel = (event) => {
    event.preventDefault();
    this.handleClear();
    this.props.onClose();
  };

  handleSave = () => {
    const data = this.stageRef.current.toDataURL();
    this.props.onChange(data);
    this.props.onClose();
  };

  handleMouseDown = (e) => {
    this.setState({ isDrawing: true });
    const pos = e.target.getStage().getPointerPosition();
    const newLines = this.state.lines;
    this.setState({ lines: [...newLines, { points: [pos.x, pos.y] }] });
  };

  handleMouseMove = (e) => {
    if (!this.state.isDrawing) {
      return;
    }
    const stage = e.target.getStage();
    if (stage !== undefined) {
      const point = stage.getPointerPosition();
      const newLines = this.state.lines;
      let lastLine = newLines[newLines.length - 1];
      // add point
      if (lastLine !== undefined) {
        lastLine.points = lastLine.points.concat([point.x, point.y]);
        // replace last
        newLines.splice(newLines.length - 1, 1, lastLine);
        setTimeout(() => {
          this.setState({ lines: newLines.concat() });
        });
      }
    }
  };

  handleMouseUp = () => {
    this.setState({ isDrawing: false });
  };

  handleColorPickerClose = action((color) => {
    this.colorPickerOpen = false;
    if (color) {
      this.setState({ annotationColor: color.annotationColor });
    }
  });

  handleUndo = (e) => {
    const newLines = this.state.lines;
    if (newLines.length === 0) {
      return;
    }
    const newUndoList = this.state.undoList;
    newUndoList.splice(newUndoList.length - 1, 0, newLines.pop());
    this.setState({
      undoList: newUndoList,
      redoList: newUndoList,
      lines: newLines.concat()
    });
  };

  handleRedo = () => {
    const redoList = this.state.redoList;
    if (redoList.length === 0) {
      return;
    }
    const newLines = this.state.lines;

    newLines.splice(newLines.length - 1, 0, redoList.pop());
    this.setState({ lines: newLines.concat() });
  };

  handleClear = (e) => {
    this.setState({
      lines: [],
      redoList: [],
      undoList: []
    });
  };

  handleDownload = (e) => {
    const uri = this.stageRef.current.toDataURL();
    this.downloadURI(uri, "image.png");
  };

  downloadURI = (uri, name) => {
    const link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  render() {
    const { classes } = this.props;
    return (
      <>
        <Dialog
          open={this.props.open}
          fullScreen
          TransitionComponent={Transition}
        >
          <DialogContent className={classes.dialogContent}>
            <div className={classes.topBar}>
              <Button
                color="inherit"
                onClick={this.handleCancel}
                aria-label="Cancel"
              >
                Cancel
              </Button>
              <Button
                color="inherit"
                onClick={this.handleSave}
                aria-label="Save"
              >
                Save
              </Button>
            </div>

            <div className={classes.stageWrapper}>
              <Stage
                width={stageWidth}
                height={stageHeight}
                ref={this.stageRef}
                onMouseDown={this.handleMouseDown}
                onMousemove={this.handleMouseMove}
                onMouseup={this.handleMouseUp}
                onTouchStart={this.handleMouseDown}
                onTouchEnd={this.handleMouseUp}
                onTouchMove={this.handleMouseMove}
              >
                <Layer ref={this.layerRef}>
                  <LoadImage url="/images/cat.png" />
                  {this.state.lines.map((line, i) => (
                    <Line
                      key={i}
                      points={line.points}
                      stroke={this.state.annotationColor}
                      strokeWidth={3}
                      tension={0.5}
                      lineCap="round"
                    />
                  ))}
                </Layer>
              </Stage>
            </div>
          </DialogContent>
          <DialogActions>
            <div className={classes.dialogActions}>
              <Button
                aria-label="Undo"
                color="primary"
                onClick={this.handleUndo}
              >
                undo
              </Button>

              <Button
                color="primary"
                aria-label="Redo"
                onClick={this.handleRedo}
              >
                redo
              </Button>

              <Button
                color="primary"
                aria-label="Reset"
                onClick={this.handleClear}
              >
                delete
              </Button>

              <Button
                color="primary"
                aria-label="Download"
                onClick={this.handleDownload}
              >
                download
              </Button>

              <ColorPicker
                open={this.colorPickerOpen}
                onClose={this.handleColorPickerClose}
                annotationColor={this.state.annotationColor}
              />
            </div>
          </DialogActions>
        </Dialog>
      </>
    );
  }
}

const styles = (theme) => ({
  flex: {
    flex: 1
  },
  topBar: {
    position: "absolute",
    left: 8,
    top: 8
  },
  stageWrapper: {
    display: "flex",
    flexDirection: "column",
    marginTop: 30,
    padding: 10,
    justifyContent: "center",
    alignItems: "center"
  },
  dialogContent: {
    display: "flex",
    flexDirection: "column"
  },
  dialogActions: {
    display: "flex",
    flexDirection: "row",
    flexShrink: 1
  },
  dialogButtons: {
    padding: "1rem"
  }
});

export default withStyles(styles)(AnnotationDialog);
