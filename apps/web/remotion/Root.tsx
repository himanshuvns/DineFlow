import React from 'react';
import { Composition } from 'remotion';
import { DineFlowPromo, defaultDineFlowPromoProps, DineFlowPromoProps } from './compositions/DineFlowPromo';
import { QROrderingDemo, defaultQROrderingDemoProps, QROrderingDemoProps } from './compositions/QROrderingDemo';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition<any, DineFlowPromoProps>
        id="DineFlowPromo"
        component={DineFlowPromo}
        durationInFrames={360}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={defaultDineFlowPromoProps}
      />
      <Composition<any, QROrderingDemoProps>
        id="QROrderingDemo"
        component={QROrderingDemo}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={defaultQROrderingDemoProps}
      />
    </>
  );
};
