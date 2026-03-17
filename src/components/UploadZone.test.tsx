import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UploadZone } from './UploadZone';
import * as fileValidation from '../utils/fileValidation';
import { toast } from 'sonner';

vi.mock('../utils/fileValidation', () => ({
  validateFiles: vi.fn(),
  formatFileSize: vi.fn(() => '1 KB'),
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe('UploadZone', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('adds valid files and uploads them', async () => {
    const onUpload = vi.fn();
    const file = new File(['hello'], 'image.jpg', { type: 'image/jpeg' });

    vi.mocked(fileValidation.validateFiles).mockReturnValue({
      valid: [file],
      invalid: [],
    });

    render(<UploadZone onUpload={onUpload} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    expect(await screen.findByText('Selected Files (1)')).toBeInTheDocument();
    expect(screen.getByText('image.jpg')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Upload 1 file/i }));

    expect(onUpload).toHaveBeenCalledWith([file]);
    expect(screen.queryByText('Selected Files (1)')).not.toBeInTheDocument();
  });

  it('shows toast errors for invalid files', async () => {
    const invalidFile = new File(['bad'], 'bad.exe', { type: 'application/x-msdownload' });

    vi.mocked(fileValidation.validateFiles).mockReturnValue({
      valid: [],
      invalid: [{ file: invalidFile, error: 'File type is not supported' }],
    });

    render(<UploadZone onUpload={vi.fn()} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [invalidFile] } });

    expect(toast.error).toHaveBeenCalledWith('bad.exe: File type is not supported');
  });

  it('removes a selected file', async () => {
    const file = new File(['hello'], 'video.mp4', { type: 'video/mp4' });

    vi.mocked(fileValidation.validateFiles).mockReturnValue({
      valid: [file],
      invalid: [],
    });

    render(<UploadZone onUpload={vi.fn()} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    expect(await screen.findByText('video.mp4')).toBeInTheDocument();

    const buttons = screen.getAllByRole('button');
    await userEvent.click(buttons.find((button) => button.textContent === '')!);

    expect(screen.queryByText('video.mp4')).not.toBeInTheDocument();
  });
});
