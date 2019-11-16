import React, { Component } from 'react';
import './SpiritEditor.css';

import {
  Route,
} from 'react-router-dom';
import { SpiritEditorPropTypes } from '../../types';

import { SpiritList } from './SpiritList';
import { SpiritContent } from './SpiritContent';
import { FractionList } from './FractionList';

export class SpiritEditor extends Component {
  static propTypes = SpiritEditorPropTypes;

  constructor() {
    super();
    this.state = {
    };
  }

  // eslint-disable-next-line max-lines-per-function
  render() {
    const { spiritService } = this.props;

    return (
      <div className="SpiritEditor h-full flex">
        <SpiritList spiritService={spiritService} />
        <Route
          path="/spiritEditor/:id"
          render={({ match }) => {
            const { id } = match.params;

            return (
              <SpiritContent
                id={Number(id)}
                spiritService={spiritService}
                spiritTmp={spiritService.getSpirit(Number(id))}
              />
            );
          }}
        />
        <FractionList spiritService={spiritService} />
      </div>
    );
  }
}
