import { Camera, FileSystem, Permissions} from 'expo';
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import GalleryScreen from './GalleryScreen';
import { Ionicons, MaterialIcons, Foundation} from '@expo/vector-icons';

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

toggleFlash = () => this.setState({ flash: flashModeOrder [this.state.flash] });

toggleFacing = () => this.setState({ type: this.state.type === 'back' ? 'front' : 'back' });

toggleFocus = () => this.setState({ autoFocus: this.state.autoFocus === 'on' ? 'off' : 'on' });

toggleView = () => this.setState({ showGallery: !this.state.showGallery, newPhotos: false });

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
  <View>  
    <Text style={{ color: "white", fontWeight: 'bold', paddingTop: 10, fontSize: 20 }}>Smile!</Text>
  </View>
  <View>
    <TouchableOpacity onPress={this.takePicture}>
      <Ionicons name="ios-radio-button-on" size={50} color="white" />
    </TouchableOpacity>
  </View> 
  <TouchableOpacity style={styles.bottomButton} onPress={this.toggleView}>
    <View>
      <Foundation name="thumbnails" size={40} style={{color: 'white'}} />
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
  flex: 1,
  backgroundColor: '#000',
  },

  topBar: {
  backgroundColor: '#24ab9e',
  flexDirection: 'row',
  justifyContent: 'space-around',
  paddingTop: 15,
  },

  toggleButton: {
  flex: 0.25,
  height: 40,
  marginHorizontal: 2,
  marginBottom: 10,
  marginTop: 20,
  padding: 5,
  alignItems: 'center',
  justifyContent: 'center',
  },
  
  autoFocusLabel: {
  fontSize: 20,
  fontWeight: 'bold'
  },

  bottomBar: {
  backgroundColor: '#24ab9e',
  flexDirection: 'row',
  justifyContent: 'space-around',
  paddingTop: 15,
  },

  camera: {
  flex: 1,
  justifyContent: 'space-between',
  },

  bottomButton: {
  flex: 0.2, 
  height: 58, 
  justifyContent: 'center',
  alignItems: 'center',
  },

  gallery: {
  flex: 0.1,
  flexDirection: 'row',
  flexWrap: 'wrap',
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