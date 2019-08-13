import React from 'react';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';


const pictureSize = 150;

export default class Photo extends React.Component {
    state = {
      selected: false,
      image: null,
    };
    _mounted = false;
  
    componentDidMount() {
      this._mounted = true;
    }
  
    componentWillUnmount() {
      this._mounted = false;
    }
  
    toggleSelection = () => {
      this.setState(
        { selected: !this.state.selected },
        () => this.props.onSelectionToggle(this.props.uri, this.state.selected)
      );
    }

getImageDimensions = ({ width, height }) => {
    if (width > height) {
        const scaledHeight = pictureSize * height / width;
        return {
            width: pictureSize,
            height: scaledHeight,

            scaleX: pictureSize / width, 
            scaleY: scaledHeight / height,

            offsetX: 0, 
            offsetY: (pictureSize - scaledHeight) / 2,
        };
    } else {
        const scaledWidth = pitureSize * width / height;
        return {
            width: scaledWisth, 
            height: pictureSize, 

            scaleX: scaledWidth / width,
            scaleY: pictureSize / height,
    
            offsetX: (pictureSize - scaledWidth) / 2,
            offsetY: 0,
          };
        }
    };


      render = () => {
        const { uri } = this.props;
        return (
            <TouchableOpacity
              style={styles.pictureWrapper}
              onPress={this.toggleSelection}
              activeOpacity={1}
            >
              <Image
                style={styles.picture}
                source={{ uri }}
              />
          
          {this.state.selected && <Ionicons name="md-checkmark-circle" size={40} color="#24ab9e" />}

            </TouchableOpacity>
          );
      };
    }

    const styles = StyleSheet.create({
        picture: {
          position: 'absolute',
          bottom: 0,
          right: 0,
          left: 0,
          top: 0,
          resizeMode: 'contain',
        },
        pictureWrapper: {
          width: pictureSize,
          height: pictureSize,
          alignItems: 'center',
          justifyContent: 'center',
          margin: 1,
        },
      });