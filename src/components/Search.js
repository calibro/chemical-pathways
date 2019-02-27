import React, { Component } from 'react';
import Autocomplete from 'react-autocomplete';
import { AppContext } from '../appContext';

class Search extends Component {
  constructor(props) {
    super(props);

    this.state = {
      value: ''
    };
  }

  matchStateToTerm = (elem, value) => {
    if (value.length > 0) {
      if (this.props.objectKey) {
        console.log(
          elem[this.props.objectKey]
            .toLowerCase()
            .indexOf(value.toLowerCase()) !== -1
        );
        return (
          elem[this.props.objectKey]
            .toLowerCase()
            .indexOf(value.toLowerCase()) !== -1
        );
      } else {
        return elem.name.toLowerCase().indexOf(value.toLowerCase()) !== -1;
      }
    }
  };

  render() {
    const { items, type, selectionCallBack, objectKey } = this.props;
    const { value } = this.state;

    return (
      <div className='autocomplete-container'>
        <img
          src='images/magnify.svg'
          width={20}
          className='autocomplete-icon'
        />
        <Autocomplete
          getItemValue={item => (objectKey ? item[objectKey] : item.name)}
          items={items}
          autoHighlight={true}
          inputProps={{
            className: 'autocomplete-input',
            placeholder: `Search ${type}`
          }}
          wrapperStyle={{
            position: 'relative'
          }}
          menuStyle={{
            backgroundColor: 'white',
            position: 'absolute',
            zIndex: 999,
            top: 31,
            left: 0
          }}
          open={true}
          renderItem={(item, isHighlighted) => (
            <div
              key={item._id}
              id={isHighlighted}
              style={{
                padding: '10px',
                borderBottom: '1px solid #d7d7d7',
                borderLeft: '1px solid #d7d7d7',
                borderRight: '1px solid #d7d7d7',
                boxShadow:
                  'box-shadow: 0 2px 4px 2px rgba(217, 217, 217, 0.56)',
                cursor: 'pointer'
              }}
              className='hover-el'
            >
              {objectKey ? item[objectKey] : item.name}
            </div>
          )}
          value={value}
          shouldItemRender={this.matchStateToTerm}
          onChange={(event, value) => this.setState({ value: value })}
          onSelect={val => {
            selectionCallBack(type, val.toLowerCase());
            this.setState({ value: '' });
          }}
        />
      </div>
    );
  }
}

Search.contextType = AppContext;

export default Search;
