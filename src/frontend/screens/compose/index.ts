/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import isolate from '@cycle/isolate';
import {ReactElement} from 'react';
import {ReactSource} from '@cycle/react';
import {StateSource, Reducer} from '@cycle/state';
import {Command, NavSource} from 'cycle-native-navigation';
import {
  Command as StorageCommand,
  AsyncStorageSource,
} from 'cycle-native-asyncstorage';
import {MsgId, FeedId} from 'ssb-typescript';
import {SSBSource, Req} from '../../drivers/ssb';
import {DialogSource} from '../../drivers/dialogs';
import {topBar, Sinks as TBSinks} from './top-bar';
import intent from './intent';
import model, {State, topBarLens} from './model';
import view from './view';
import ssb from './ssb';
import navigation from './navigation';
import dialog from './dialog';
import asyncStorage from './asyncstorage';

export type Props = {
  text?: string;
  authors?: Array<FeedId>;
  root?: MsgId;
  branch?: MsgId;
};

export type Sources = {
  screen: ReactSource;
  navigation: NavSource;
  props: Stream<Props>;
  asyncstorage: AsyncStorageSource;
  state: StateSource<State>;
  ssb: SSBSource;
  dialog: DialogSource;
};

export type Sinks = {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  asyncstorage: Stream<StorageCommand>;
  state: Stream<Reducer<State>>;
  keyboard: Stream<'dismiss'>;
  ssb: Stream<Req>;
};

export const navOptions = {
  topBar: {
    visible: false,
    height: 0,
  },
  sideMenu: {
    left: {
      enabled: false,
    },
  },
  animations: {
    push: {
      enabled: false,
    },
    pop: {
      enabled: false,
    },
  },
};

export function compose(sources: Sources): Sinks {
  const topBarSinks: TBSinks = isolate(topBar, {
    '*': 'topBar',
    state: topBarLens,
  })(sources);

  const actions = intent(
    sources.screen,
    sources.navigation,
    topBarSinks.back,
    topBarSinks.previewToggle,
    topBarSinks.done,
    sources.state.stream,
    sources.dialog,
  );
  const dialogActions = dialog(actions, sources.dialog);
  const actionsPlus = {...actions, ...dialogActions};
  const dismissKeyboard$ = actions.exitOfAnyKind$.mapTo('dismiss' as 'dismiss');
  const vdom$ = view(sources.state.stream, topBarSinks.screen);
  const command$ = navigation(actionsPlus);
  const reducer$ = model(
    sources.props,
    actionsPlus,
    sources.state.stream,
    sources.asyncstorage,
    sources.ssb,
  );
  const storageCommand$ = asyncStorage(actionsPlus, sources.state.stream);
  const newContent$ = ssb(actionsPlus);

  return {
    keyboard: dismissKeyboard$,
    screen: vdom$,
    navigation: command$,
    asyncstorage: storageCommand$,
    state: reducer$,
    ssb: newContent$,
  };
}
