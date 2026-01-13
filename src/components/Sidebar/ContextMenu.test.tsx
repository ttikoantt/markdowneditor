import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContextMenu } from './ContextMenu';

describe('ContextMenu', () => {
  const defaultProps = {
    x: 100,
    y: 100,
    onClose: vi.fn(),
    onRename: vi.fn(),
    onDelete: vi.fn(),
    onNewFile: vi.fn(),
    onNewFolder: vi.fn(),
    isFolder: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders rename and delete options for files', () => {
    render(<ContextMenu {...defaultProps} />);
    expect(screen.getByText('Rename')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('renders new file and folder options for folders', () => {
    render(<ContextMenu {...defaultProps} isFolder={true} />);
    expect(screen.getByText('New File')).toBeInTheDocument();
    expect(screen.getByText('New Folder')).toBeInTheDocument();
    expect(screen.getByText('Rename')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('does not render new file/folder options for files', () => {
    render(<ContextMenu {...defaultProps} isFolder={false} />);
    expect(screen.queryByText('New File')).not.toBeInTheDocument();
    expect(screen.queryByText('New Folder')).not.toBeInTheDocument();
  });

  it('calls onRename and onClose when Rename is clicked', async () => {
    const user = userEvent.setup();
    render(<ContextMenu {...defaultProps} />);

    await user.click(screen.getByText('Rename'));

    expect(defaultProps.onRename).toHaveBeenCalled();
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onDelete and onClose when Delete is clicked', async () => {
    const user = userEvent.setup();
    render(<ContextMenu {...defaultProps} />);

    await user.click(screen.getByText('Delete'));

    expect(defaultProps.onDelete).toHaveBeenCalled();
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onNewFile and onClose when New File is clicked', async () => {
    const user = userEvent.setup();
    render(<ContextMenu {...defaultProps} isFolder={true} />);

    await user.click(screen.getByText('New File'));

    expect(defaultProps.onNewFile).toHaveBeenCalled();
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onNewFolder and onClose when New Folder is clicked', async () => {
    const user = userEvent.setup();
    render(<ContextMenu {...defaultProps} isFolder={true} />);

    await user.click(screen.getByText('New Folder'));

    expect(defaultProps.onNewFolder).toHaveBeenCalled();
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('closes on Escape key', () => {
    render(<ContextMenu {...defaultProps} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('closes on click outside', () => {
    render(
      <div>
        <div data-testid="outside">Outside</div>
        <ContextMenu {...defaultProps} />
      </div>
    );

    fireEvent.mouseDown(screen.getByTestId('outside'));

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('menu has proper structure with buttons', () => {
    render(<ContextMenu {...defaultProps} />);

    // Check that buttons exist and are properly structured
    const renameButton = screen.getByRole('button', { name: /rename/i });
    const deleteButton = screen.getByRole('button', { name: /delete/i });

    expect(renameButton).toBeInTheDocument();
    expect(deleteButton).toBeInTheDocument();
    expect(renameButton).toHaveAttribute('type', 'button');
    expect(deleteButton).toHaveAttribute('type', 'button');
  });

  it('positions menu at specified coordinates', () => {
    render(<ContextMenu {...defaultProps} x={200} y={300} />);

    const menu = screen.getByText('Rename').closest('div');
    expect(menu).toHaveStyle({ left: '200px', top: '300px' });
  });

  it('returns null when no menu items available', () => {
    const { container } = render(
      <ContextMenu
        x={100}
        y={100}
        onClose={vi.fn()}
        onRename={undefined}
        onDelete={undefined}
        isFolder={false}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('applies danger styling to delete button', () => {
    render(<ContextMenu {...defaultProps} />);

    const deleteButton = screen.getByText('Delete');
    expect(deleteButton).toHaveClass('text-red-600');
  });

  it('only shows provided options', () => {
    render(
      <ContextMenu
        x={100}
        y={100}
        onClose={vi.fn()}
        onRename={vi.fn()}
        onDelete={undefined}
        isFolder={false}
      />
    );

    expect(screen.getByText('Rename')).toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });
});
