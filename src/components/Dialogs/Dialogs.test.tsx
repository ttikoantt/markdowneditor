import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RenameDialog } from './RenameDialog';
import { DeleteDialog } from './DeleteDialog';
import { NewFolderDialog } from './NewFolderDialog';

describe('RenameDialog', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    currentName: 'test.md',
    itemType: 'file' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with current name', () => {
    render(<RenameDialog {...defaultProps} />);
    expect(screen.getByDisplayValue('test.md')).toBeInTheDocument();
  });

  it('shows correct title for file', () => {
    render(<RenameDialog {...defaultProps} />);
    expect(screen.getByText('Rename File')).toBeInTheDocument();
  });

  it('shows correct title for folder', () => {
    render(<RenameDialog {...defaultProps} itemType="folder" />);
    expect(screen.getByText('Rename Folder')).toBeInTheDocument();
  });

  it('calls onConfirm with new name when submitted', async () => {
    const user = userEvent.setup();
    render(<RenameDialog {...defaultProps} />);

    const input = screen.getByLabelText('New Name');
    await user.clear(input);
    await user.type(input, 'newfile.md');
    await user.click(screen.getByText('Rename'));

    expect(defaultProps.onConfirm).toHaveBeenCalledWith('newfile.md');
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('adds .md extension to files without it', async () => {
    const user = userEvent.setup();
    render(<RenameDialog {...defaultProps} />);

    const input = screen.getByLabelText('New Name');
    await user.clear(input);
    await user.type(input, 'newfile');
    await user.click(screen.getByText('Rename'));

    expect(defaultProps.onConfirm).toHaveBeenCalledWith('newfile.md');
  });

  it('does not add .md extension to folders', async () => {
    const user = userEvent.setup();
    render(<RenameDialog {...defaultProps} itemType="folder" currentName="test-folder" />);

    const input = screen.getByLabelText('New Name');
    await user.clear(input);
    await user.type(input, 'newfolder');
    await user.click(screen.getByText('Rename'));

    expect(defaultProps.onConfirm).toHaveBeenCalledWith('newfolder');
  });

  it('shows error for empty name', async () => {
    const user = userEvent.setup();
    render(<RenameDialog {...defaultProps} />);

    const input = screen.getByLabelText('New Name');
    await user.clear(input);
    await user.click(screen.getByText('Rename'));

    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(defaultProps.onConfirm).not.toHaveBeenCalled();
  });

  it('shows error for invalid characters', async () => {
    const user = userEvent.setup();
    render(<RenameDialog {...defaultProps} />);

    const input = screen.getByLabelText('New Name');
    await user.clear(input);
    await user.type(input, 'invalid/name');
    await user.click(screen.getByText('Rename'));

    expect(screen.getByText('Name contains invalid characters')).toBeInTheDocument();
    expect(defaultProps.onConfirm).not.toHaveBeenCalled();
  });

  it('closes without calling onConfirm when name unchanged', async () => {
    const user = userEvent.setup();
    render(<RenameDialog {...defaultProps} />);

    await user.click(screen.getByText('Rename'));

    expect(defaultProps.onConfirm).not.toHaveBeenCalled();
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onClose when Cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<RenameDialog {...defaultProps} />);

    await user.click(screen.getByText('Cancel'));

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('does not render when isOpen is false', () => {
    render(<RenameDialog {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Rename File')).not.toBeInTheDocument();
  });
});

describe('DeleteDialog', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    itemName: 'test.md',
    itemType: 'file' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with item name', () => {
    render(<DeleteDialog {...defaultProps} />);
    expect(screen.getByText('test.md')).toBeInTheDocument();
  });

  it('shows correct title for file', () => {
    render(<DeleteDialog {...defaultProps} />);
    expect(screen.getByText('Delete File')).toBeInTheDocument();
  });

  it('shows correct title for folder', () => {
    render(<DeleteDialog {...defaultProps} itemType="folder" />);
    expect(screen.getByText('Delete Folder')).toBeInTheDocument();
  });

  it('shows folder warning when deleting folder', () => {
    render(<DeleteDialog {...defaultProps} itemType="folder" />);
    expect(
      screen.getByText('This will delete all files and subfolders inside it.')
    ).toBeInTheDocument();
  });

  it('does not show folder warning when deleting file', () => {
    render(<DeleteDialog {...defaultProps} />);
    expect(
      screen.queryByText('This will delete all files and subfolders inside it.')
    ).not.toBeInTheDocument();
  });

  it('shows warning about action being permanent', () => {
    render(<DeleteDialog {...defaultProps} />);
    expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();
  });

  it('calls onConfirm and onClose when Delete is clicked', async () => {
    const user = userEvent.setup();
    render(<DeleteDialog {...defaultProps} />);

    await user.click(screen.getByText('Delete'));

    expect(defaultProps.onConfirm).toHaveBeenCalled();
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onClose when Cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<DeleteDialog {...defaultProps} />);

    await user.click(screen.getByText('Cancel'));

    expect(defaultProps.onClose).toHaveBeenCalled();
    expect(defaultProps.onConfirm).not.toHaveBeenCalled();
  });

  it('does not render when isOpen is false', () => {
    render(<DeleteDialog {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Delete File')).not.toBeInTheDocument();
  });
});

describe('NewFolderDialog', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    currentPath: '/workspace',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with title', () => {
    render(<NewFolderDialog {...defaultProps} />);
    expect(screen.getByText('New Folder')).toBeInTheDocument();
  });

  it('shows current path when provided', () => {
    render(<NewFolderDialog {...defaultProps} />);
    expect(screen.getByText('Location: /workspace')).toBeInTheDocument();
  });

  it('does not show path when not provided', () => {
    render(<NewFolderDialog {...defaultProps} currentPath={undefined} />);
    expect(screen.queryByText(/Location:/)).not.toBeInTheDocument();
  });

  it('calls onConfirm with folder name when submitted', async () => {
    const user = userEvent.setup();
    render(<NewFolderDialog {...defaultProps} />);

    const input = screen.getByLabelText('Folder Name');
    await user.type(input, 'new-folder');
    await user.click(screen.getByText('Create'));

    expect(defaultProps.onConfirm).toHaveBeenCalledWith('new-folder');
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('shows error for empty name', async () => {
    const user = userEvent.setup();
    render(<NewFolderDialog {...defaultProps} />);

    await user.click(screen.getByText('Create'));

    expect(screen.getByText('Folder name is required')).toBeInTheDocument();
    expect(defaultProps.onConfirm).not.toHaveBeenCalled();
  });

  it('shows error for invalid characters', async () => {
    const user = userEvent.setup();
    render(<NewFolderDialog {...defaultProps} />);

    const input = screen.getByLabelText('Folder Name');
    await user.type(input, 'invalid/folder');
    await user.click(screen.getByText('Create'));

    expect(screen.getByText('Folder name contains invalid characters')).toBeInTheDocument();
    expect(defaultProps.onConfirm).not.toHaveBeenCalled();
  });

  it('trims folder name before validating', async () => {
    const user = userEvent.setup();
    render(<NewFolderDialog {...defaultProps} />);

    const input = screen.getByLabelText('Folder Name');
    await user.type(input, '  my-folder  ');
    await user.click(screen.getByText('Create'));

    expect(defaultProps.onConfirm).toHaveBeenCalledWith('my-folder');
  });

  it('clears input when closed', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<NewFolderDialog {...defaultProps} />);

    const input = screen.getByLabelText('Folder Name');
    await user.type(input, 'test-folder');

    await user.click(screen.getByText('Cancel'));

    rerender(<NewFolderDialog {...defaultProps} />);
    const newInput = screen.getByLabelText('Folder Name');
    expect(newInput).toHaveValue('');
  });

  it('does not render when isOpen is false', () => {
    render(<NewFolderDialog {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('New Folder')).not.toBeInTheDocument();
  });
});
