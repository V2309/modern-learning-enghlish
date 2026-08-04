import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AddShadowingModal } from '@/components/shadowing/AddShadowingModal';

describe('AddShadowingModal', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('does not fetch transcript automatically when a YouTube URL is entered', async () => {
    const fetchMock = vi.mocked(global.fetch);

    render(
      <AddShadowingModal
        show={true}
        isSaving={false}
        onClose={() => {}}
        onSave={() => {}}
      />,
    );

    const input = screen.getByPlaceholderText('https://www.youtube.com/watch?v=...');
    fireEvent.change(input, {
      target: { value: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    });

    await waitFor(() => {
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });
});
