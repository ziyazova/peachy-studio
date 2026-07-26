import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Widget } from '../../../domain/entities/Widget';
import { CalendarWidget } from '../widgets/CalendarWidget';
import { ClockWidget } from '../widgets/ClockWidget';
import { BoardWidget } from '../widgets/BoardWidget';
import { TimerWidget } from '../widgets/TimerWidget';

interface WidgetDisplayProps {
  widget: Widget | null;
}

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const DisplayContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
`;

const WidgetFrame = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px;
  position: relative;
  z-index: 1;
`;

const EmptyTitle = styled.h3`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.tertiary};
  margin: 0 0 4px 0;
  letter-spacing: -0.01em;
`;

const EmptyDescription = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.tertiary};
  margin: 0;
  max-width: 220px;
  line-height: 1.5;
  margin: 0 auto;
  opacity: 0.7;
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 48px;
  position: relative;
  z-index: 1;
`;

const WidgetContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${fadeIn} 0.4s cubic-bezier(0.22, 1, 0.36, 1) 0.24s both;
`;

export const WidgetDisplay: React.FC<WidgetDisplayProps> = ({ widget }) => {
  if (!widget) {
    return (
      <DisplayContainer>
        <EmptyState>
          <EmptyTitle>Nothing here yet</EmptyTitle>
          <EmptyDescription>
            Pick a widget from the sidebar to get started
          </EmptyDescription>
        </EmptyState>
      </DisplayContainer>
    );
  }

  const renderWidget = () => {
    switch (widget.type) {
      case 'calendar':
        return <CalendarWidget widget={widget} />;
      case 'clock':
        return <ClockWidget widget={widget} />;
      case 'board':
        return <BoardWidget widget={widget} />;
      case 'timer':
        return <TimerWidget widget={widget} />;
      default:
        return (
          <ErrorState>
            <EmptyTitle>Not Supported</EmptyTitle>
            <EmptyDescription>
              Widget type "{widget.type}" is not yet implemented
            </EmptyDescription>
          </ErrorState>
        );
    }
  };

  return (
    <DisplayContainer>
      <WidgetFrame>
        <WidgetContainer>
          {renderWidget()}
        </WidgetContainer>
      </WidgetFrame>
    </DisplayContainer>
  );
};
