/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {FeedId} from 'ssb-typescript';
import {Stream} from 'xstream';
import {Reducer} from '@cycle/state';
import {SSBSource} from '../../drivers/ssb';

export type State = {
  selfFeedId: FeedId;
  selfAvatarUrl?: string;
  name?: string;
};

export default function model(ssbSource: SSBSource): Stream<Reducer<State>> {
  const initAboutReducer$ = ssbSource.selfFeedId$
    .take(1)
    .map((selfFeedId) => ssbSource.profileAboutLive$(selfFeedId))
    .flatten()
    .map(
      (about) =>
        function initAboutReducer(prev: State): State {
          const id = about.id;
          let name = '';
          if (!!about.name && about.name !== id) {
            name = about.name;
          }
          return {selfFeedId: id, name, selfAvatarUrl: about.imageUrl};
        },
    );

  return initAboutReducer$;
}
