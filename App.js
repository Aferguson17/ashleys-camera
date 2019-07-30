import { Constants, Camera, FileSystem, Permissions} from 'expo';
import React from 'react';
import GalleryScreen from './GalleryScreen';
import { Image, StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import { Ionicons, MaterialIcons, Foundation, Octicsons} from '@expo/vector-icons';

const flashModeOrder = {
  off: 'on',
  on: 'auto',
  auto: 'torch',
  torch: 'off',
};

const flashIcons = {
  off: 'flash-off',
  on: 'flash-on',
  auto: 'flash-auto',
  torch: 'highlight'
};

export default class CameraScreen extends React.Component {
  state = {
    flash: 'off',
    autoFocus: 'on',
    type: 'back',
    newPhotos: false, 
    permissionsGranted: false,
    pictureSize: undefined,
    pictureSizes: [],
    pictureSizeId: 0,
    showGallery: false,
  };

async componentWillMount() {
  const { status } = await Permissions.askAsync(Permissions.CAMERA);

  this.setState({ permissionsGranted: status === 'granted' });
  }

  componentDidMount() {
    FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'photos').catch(e => {
      console.log(e, 'Directory exists');
  });
}

getRatios = async () => {
  const ratios = await this.camera.getSupportedRatios();
  return ratios;
};

toggleView = () => this.setState({ showGallery: !this.state.showGallery, newPhotos: false });

toggleFlash = () => this.setState({ flash: flashModeOrder [this.state.flash] });

toggleFacing = () => this.setState({ type: this.state.type === 'back' ? 'front' : 'back' });

toggleFocus = () => this.setState({ autoFocus: this.state.autoFocus === 'on' ? 'off' : 'on' });

takePicture = () => {
  if (this.camera) {
    this.camera.takePictureAsync({ onPictureSaved: this.onPictureSaved });
  }
};

handleMountError = ({ message }) => console.error(message);

onPictureSaved = async photo => {
  await FileSystem.moveAsync ({
    from: photo.uri,
    to: `${FileSystem.documentDirectory}photos/${Date.now()}.jpg`,
  });
  this.setState({ newPhotos: true });
}

collectPictureSizes = async () => {
  if (this.camera) {
    const pictureSizes = await this.camera.getAvailablePictureSizesAsync(this.state.ratio);
    let pictureSizeId = 0;
    if (Platform.OS === 'ios') {
      pictureSizeId = pictureSizes.indexOf('High');
    } else {
      pictureSizeId = pictureSizes.length-1;
    }
    this.setState({ pictureSizes, pictureSizeId, pictureSize: pictureSizes[pictureSizeId] });
  }
};

previousPictureSize = () => this.changePictureSize(1);
nextPictureSize = () => this.changePictureSize(-1);

changePictureSize = direction => {
  let newId = this.state.pictureSizeId + direction;
  const length = this.state.pictureSizes.length;
  if (newId >= length) {
    newId = 0;
  } else if (newId < 0) {
    newId = length -1;
  }
  this.setState({ pictureSize: this.state.pictureSizes[newId], pictureSizeId: newId });
}

renderGallery() {
  return <GalleryScreen onPress={this.toggleView.bind(this)} />;
}

renderNoPermissions = () => 
<View style={styles.noPermissions}>
  <Text style={{ color: 'white' }}>
    Camera Permissions Denied!
  </Text>
</View>

renderTopBar = () =>
  <View 
    style={styles.topBar}>
      <TouchableOpacity style={styles.toggleButton} onPress={this.toggleFlash}>
        <MaterialIcons name={flashIcons[this.state.flash]} size={32} color="white" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.toggleButton} onPress={this.toggleFocus}>
        <Text style={[styles.autoFocusLabel, { color: this.state.autoFocus === 'on' ? "white" : "#6b6b6b" }]}>AUTO</Text>
      </TouchableOpacity>   
      <TouchableOpacity style={styles.toggleButton} onPress={this.toggleFacing}>
        <Ionicons name="ios-reverse-camera" size={32} color="white" />
      </TouchableOpacity>
    </View>

renderBottomBar = () =>
<View style={styles.bottomBar}>
  <View style={{ flex: 2 }}>
    <TouchableOpacity onPress={this.takePicture}style={{ alignSelf: 'center' }}>
      <Ionicons name="ios-radio-button-on" size={70} color="white" />
    </TouchableOpacity>
  </View> 

  <TouchableOpacity style={styles.bottomButton} onPress={this.toggleView}>
    <View>
      <Foundation name="thumbnails" size={30} style={{color: 'white', alignSelf: 'center'}} />
      {this.state.newPhotos && <View style={styles.newPhotosDot}/>}
    </View>
  </TouchableOpacity>
</View>

renderCamera = () =>
(
  <View style={{ flex: 4 }}>
    <Camera
      ref={ref => {
        this.camera = ref;
      }}
      style={styles.camera}
      onCameraReady={this.collectPictureSizes}
      type={this.state.type}
      flashMode={this.state.flash}
      autoFocus={this.state.autoFocus}
      ratio={this.state.ratio}
      pictureSize={this.state.pictureSize}
      onMountError={this.handleMountError}      
    >
      {this.renderTopBar()}
      {this.renderBottomBar()}
    </Camera>
  </View>
);

render = () =>  {
  const cameraScreenContent = this.state.permissionsGranted
    ? this.renderCamera()
    : this.renderNoPermissions();
  const content = this.state.showGallery 
    ? this.renderGallery() 
    : cameraScreenContent;
  return <View style={styles.container}>{content}</View>;
  }
}

const styles = StyleSheet.create({
container: {
flex: 4,
backgroundColor: '#000',
},

camera: {
flex: 2,
justifyContent: 'space-between',
},

topBar: {
backgroundColor: '#24ab9e',
flexDirection: 'row',
justifyContent: 'space-around',
paddingTop: 15,
},

bottomBar: {
backgroundColor: '#24ab9e',
flex: 0,
flexDirection: 'row',
},

gallery: {
flex: 1,
flexDirection: 'row',
flexWrap: 'wrap',
},

toggleButton: {
flex: 2,
height: 40,
marginHorizontal: 10,
marginBottom: 10,
marginTop: 20,
padding: 5,
alignItems: 'center',
justifyContent: 'center',
},

autoFocusLabel: {
fontSize: 15,
fontWeight: 'bold'
},

bottomButton: {
flex: 0.8, 
height: 40, 
justifyContent: 'center',
alignItems: 'center',
},

newPhotosDot: {
position: 'absolute',
top: 0,
width: 10,
height: 10,
backgroundColor: '#FF0000'
},

noPermissions: {
flex: 1,
alignItems:'center',
justifyContent: 'center',
padding: 10,
},

});